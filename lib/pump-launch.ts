import { appConfig, FEE_SHARE_BPS } from "@/lib/config";
import { requireLaunchWallets } from "@/lib/launch";
import { createRequire } from "node:module";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";

// The SDK's ESM build trips on Anchor CJS named exports. Load the CJS entry instead.
const pumpRequire = createRequire(import.meta.url);
const { PUMP_SDK } = pumpRequire("@pump-fun/pump-sdk") as typeof import("@pump-fun/pump-sdk");

const CREATE_CU = 400_000;
const FEE_SHARE_CU = 300_000;
const MICROLAMPORTS = 250_000;

export function getLaunchConnection() {
  return new Connection(appConfig.rpcUrl, "confirmed");
}

function withBudget(ixs: TransactionInstruction[], units: number) {
  return [
    ComputeBudgetProgram.setComputeUnitLimit({ units }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: MICROLAMPORTS }),
    ...ixs,
  ];
}

export async function buildCreateInstructions(params: {
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  creator: PublicKey;
}) {
  const createIx = await PUMP_SDK.createV2Instruction({
    mint: params.mint,
    name: params.name,
    symbol: params.symbol,
    uri: params.uri,
    creator: params.creator,
    user: params.creator,
    mayhemMode: false,
    holderReward: false,
  });
  return withBudget([createIx], CREATE_CU);
}

export async function buildFeeShareInstructions(params: {
  mint: PublicKey;
  creator: PublicKey;
}) {
  const { sweepWallet, protocolWallet } = requireLaunchWallets();
  const createConfigIx = await PUMP_SDK.createFeeSharingConfig({
    creator: params.creator,
    mint: params.mint,
    pool: null,
  });
  const updateIx = await PUMP_SDK.updateFeeShares({
    authority: params.creator,
    mint: params.mint,
    currentShareholders: [],
    newShareholders: [
      { address: sweepWallet, shareBps: FEE_SHARE_BPS.sweep },
      { address: protocolWallet, shareBps: FEE_SHARE_BPS.protocol },
    ],
  });
  return withBudget([createConfigIx, updateIx], FEE_SHARE_CU);
}

export function serializeUnsignedTx(
  ixs: TransactionInstruction[],
  feePayer: PublicKey,
  blockhash: string,
) {
  const tx = new Transaction();
  tx.feePayer = feePayer;
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  return tx
    .serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })
    .toString("base64");
}
