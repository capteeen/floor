import { appConfig, FEE_SHARE_BPS } from "@/lib/config";
import { PublicKey } from "@solana/web3.js";

export const PUMP_NAME_MAX = 32;
export const PUMP_SYMBOL_MAX = 10;
export const PUMP_URI_MAX = 300;
export const LAUNCH_IMAGE_MAX_BYTES = 4_000_000;

export type LaunchStage = "create" | "fee-share";

export type LaunchPrepareRequest = {
  stage: LaunchStage;
  mint: string;
  creator: string;
  name?: string;
  symbol?: string;
  uri?: string;
};

export type LaunchPrepareResponse = {
  tx: string;
  blockhash: string;
  lastValidBlockHeight: number;
  mint: string;
  sweepWallet: string;
  protocolWallet: string;
  shareBps: typeof FEE_SHARE_BPS;
};

export type LaunchResult = {
  mint: string;
  sweepWallet: string;
  protocolWallet: string;
  createSig: string;
  feeShareSig: string;
  uri: string;
  demo: boolean;
  feeShareError?: string;
};

const TICKER_RE = /^[A-Z0-9]{1,10}$/;

export function parsePubkey(value: string, label = "Address"): PublicKey {
  try {
    return new PublicKey(value);
  } catch {
    throw new Error(`${label} is not a valid Solana address.`);
  }
}

export function tryPubkey(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return new PublicKey(trimmed).toBase58();
  } catch {
    return null;
  }
}

export function launchDestinations() {
  const sweepWallet = tryPubkey(appConfig.defaultSweepWallet);
  const protocolWallet = tryPubkey(appConfig.protocolFeeWallet);
  return {
    sweepWallet,
    protocolWallet,
    ready: Boolean(sweepWallet && protocolWallet && sweepWallet !== protocolWallet),
  };
}

export function requireLaunchWallets() {
  const dest = launchDestinations();
  if (!dest.sweepWallet) {
    throw new Error("Set NEXT_PUBLIC_SWEEP_WALLET to a real public sweep wallet before launching live.");
  }
  if (!dest.protocolWallet) {
    throw new Error("Set NEXT_PUBLIC_PROTOCOL_FEE_WALLET before launching live.");
  }
  if (dest.sweepWallet === dest.protocolWallet) {
    throw new Error("Sweep wallet and protocol wallet must be different.");
  }
  return {
    sweepWallet: new PublicKey(dest.sweepWallet),
    protocolWallet: new PublicKey(dest.protocolWallet),
  };
}

export function validateCoinDetails(name: string, symbol: string) {
  const trimmedName = name.trim();
  const ticker = symbol.trim().toUpperCase();
  if (!trimmedName) throw new Error("Name is required.");
  if (trimmedName.length > PUMP_NAME_MAX) {
    throw new Error(`Name must be ${PUMP_NAME_MAX} characters or fewer.`);
  }
  if (!TICKER_RE.test(ticker)) {
    throw new Error("Ticker must be 1–10 letters or numbers.");
  }
  return { name: trimmedName, symbol: ticker };
}

export function validateMetadataUri(uri: string) {
  const trimmed = uri.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("ipfs://")) {
    throw new Error("Metadata URI is invalid.");
  }
  if (trimmed.length > PUMP_URI_MAX) {
    throw new Error("Metadata URI is too long.");
  }
  return trimmed;
}
