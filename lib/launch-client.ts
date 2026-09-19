import { appConfig } from "@/lib/config";
import { fakePubkey, fakeSig } from "@/lib/format";
import {
  launchDestinations,
  requireLaunchWallets,
  validateCoinDetails,
  type LaunchPrepareResponse,
  type LaunchResult,
} from "@/lib/launch";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { Keypair, Transaction, type Connection } from "@solana/web3.js";

type StatusFn = (status: string) => void;

function decodeTx(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return Transaction.from(bytes);
}

async function apiError(res: Response) {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { error?: string };
    if (json.error) return json.error;
  } catch {
    /* use raw text */
  }
  return text.slice(0, 240) || `Request failed (${res.status})`;
}

async function uploadMetadata(params: {
  file: File;
  name: string;
  symbol: string;
  description: string;
  website: string;
}) {
  const body = new FormData();
  body.append("file", params.file);
  body.append("name", params.name);
  body.append("symbol", params.symbol);
  body.append("description", params.description);
  body.append("website", params.website);
  body.append("showName", "true");
  const res = await fetch("/api/metadata", { method: "POST", body });
  if (!res.ok) throw new Error(await apiError(res));
  const json = (await res.json()) as { uri?: string };
  if (!json.uri) throw new Error("Metadata upload did not return a URI.");
  return json.uri;
}

async function prepareLaunch(body: Record<string, string>) {
  const res = await fetch("/api/launch/prepare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await apiError(res));
  return (await res.json()) as LaunchPrepareResponse;
}

async function signAndSend(params: {
  connection: Connection;
  wallet: WalletContextState;
  tx: Transaction;
  extraSigners?: Keypair[];
  blockhash: string;
  lastValidBlockHeight: number;
}) {
  const { wallet, connection, tx, extraSigners, blockhash, lastValidBlockHeight } = params;
  if (!wallet.publicKey) throw new Error("Wallet disconnected.");
  if (extraSigners?.length) tx.partialSign(...extraSigners);
  const signed = wallet.signTransaction
    ? await wallet.signTransaction(tx)
    : (await wallet.signAllTransactions?.([tx]))?.[0];
  if (!signed) throw new Error("Wallet did not sign the transaction.");
  if (extraSigners?.length) signed.partialSign(...extraSigners);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 3,
  });
  const confirmation = await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  if (confirmation.value.err) {
    throw new Error("Transaction landed but failed on-chain.");
  }
  return signature;
}

export async function fileFromPreview(src: string, filename: string) {
  const res = await fetch(src);
  if (!res.ok) throw new Error("Could not read the coin image.");
  const blob = await res.blob();
  const type = blob.type || "image/png";
  const ext = type.split("/")[1] || "png";
  return new File([blob], `${filename}.${ext}`, { type });
}

export async function simulateLaunch(params: {
  name: string;
  ticker: string;
  collectionSlug: string;
  collectionSweep: string;
}): Promise<LaunchResult> {
  await new Promise((r) => setTimeout(r, 700));
  const dest = launchDestinations();
  return {
    mint: fakePubkey(`mint:${params.ticker}:${params.collectionSlug}`),
    sweepWallet: dest.sweepWallet || params.collectionSweep,
    protocolWallet: dest.protocolWallet || fakePubkey("protocol:dry-run"),
    createSig: fakeSig(`create:${params.ticker}`),
    feeShareSig: fakeSig(`fees:${params.ticker}`),
    uri: "",
    demo: true,
  };
}

export async function runLiveLaunch(params: {
  connection: Connection;
  wallet: WalletContextState;
  name: string;
  ticker: string;
  description: string;
  website: string;
  imageFile: File;
  collectionSlug: string;
  onStatus: StatusFn;
}): Promise<LaunchResult> {
  const { name, symbol } = validateCoinDetails(params.name, params.ticker);
  if (!params.wallet.publicKey) throw new Error("Connect Phantom or Solflare to launch live.");
  const wallets = requireLaunchWallets();
  const creator = params.wallet.publicKey;

  params.onStatus("Uploading metadata…");
  const uri = await uploadMetadata({
    file: params.imageFile,
    name,
    symbol,
    description: params.description,
    website: params.website,
  });

  const mint = Keypair.generate();

  params.onStatus("Building create transaction…");
  const createPrepared = await prepareLaunch({
    stage: "create",
    mint: mint.publicKey.toBase58(),
    creator: creator.toBase58(),
    name,
    symbol,
    uri,
  });

  params.onStatus("Sign create in your wallet…");
  const createSig = await signAndSend({
    connection: params.connection,
    wallet: params.wallet,
    tx: decodeTx(createPrepared.tx),
    extraSigners: [mint],
    blockhash: createPrepared.blockhash,
    lastValidBlockHeight: createPrepared.lastValidBlockHeight,
  });

  params.onStatus("Coin created. Building fee split…");
  let feeShareSig = "";
  try {
    const feePrepared = await prepareLaunch({
      stage: "fee-share",
      mint: mint.publicKey.toBase58(),
      creator: creator.toBase58(),
    });
    params.onStatus("Sign fee split lock in your wallet…");
    feeShareSig = await signAndSend({
      connection: params.connection,
      wallet: params.wallet,
      tx: decodeTx(feePrepared.tx),
      blockhash: feePrepared.blockhash,
      lastValidBlockHeight: feePrepared.lastValidBlockHeight,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fee split lock failed.";
    return {
      mint: mint.publicKey.toBase58(),
      sweepWallet: wallets.sweepWallet.toBase58(),
      protocolWallet: wallets.protocolWallet.toBase58(),
      createSig,
      feeShareSig: "",
      uri,
      demo: false,
      feeShareError: message,
    };
  }

  return {
    mint: mint.publicKey.toBase58(),
    sweepWallet: wallets.sweepWallet.toBase58(),
    protocolWallet: wallets.protocolWallet.toBase58(),
    createSig,
    feeShareSig,
    uri,
    demo: false,
  };
}

export async function retryFeeShareLock(params: {
  connection: Connection;
  wallet: WalletContextState;
  mint: string;
  onStatus: StatusFn;
}) {
  if (!params.wallet.publicKey) throw new Error("Connect a wallet to lock the fee split.");
  params.onStatus("Building fee split…");
  const prepared = await prepareLaunch({
    stage: "fee-share",
    mint: params.mint,
    creator: params.wallet.publicKey.toBase58(),
  });
  params.onStatus("Sign fee split lock in your wallet…");
  return signAndSend({
    connection: params.connection,
    wallet: params.wallet,
    tx: decodeTx(prepared.tx),
    blockhash: prepared.blockhash,
    lastValidBlockHeight: prepared.lastValidBlockHeight,
  });
}

export function liveLaunchBlockedReason() {
  if (appConfig.dryRun) return "";
  if (!paramsReady()) {
    const dest = launchDestinations();
    if (!dest.sweepWallet) return "Set NEXT_PUBLIC_SWEEP_WALLET to a real public key.";
    if (!dest.protocolWallet) return "Set NEXT_PUBLIC_PROTOCOL_FEE_WALLET to a real public key.";
    return "Sweep and protocol wallets must be different.";
  }
  return "";
}

function paramsReady() {
  return launchDestinations().ready;
}
