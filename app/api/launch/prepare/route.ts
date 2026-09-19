import { appConfig, FEE_SHARE_BPS } from "@/lib/config";
import {
  parsePubkey,
  requireLaunchWallets,
  validateCoinDetails,
  validateMetadataUri,
  type LaunchPrepareRequest,
  type LaunchPrepareResponse,
  type LaunchStage,
} from "@/lib/launch";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function asStage(value: unknown): LaunchStage {
  if (value === "create" || value === "fee-share") return value;
  throw new Error("stage must be create or fee-share.");
}

export async function POST(req: Request) {
  if (appConfig.dryRun) {
    return jsonError("Live launch is off. Set NEXT_PUBLIC_DRY_RUN=false and NEXT_PUBLIC_MAINNET=true.", 403);
  }

  let body: LaunchPrepareRequest;
  try {
    body = (await req.json()) as LaunchPrepareRequest;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  try {
    const stage = asStage(body.stage);
    const mint = parsePubkey(body.mint, "Mint");
    const creator = parsePubkey(body.creator, "Creator");
    const { sweepWallet, protocolWallet } = requireLaunchWallets();

    const { buildCreateInstructions, buildFeeShareInstructions, getLaunchConnection, serializeUnsignedTx } =
      await import("@/lib/pump-launch");

    const ixs =
      stage === "create"
        ? await (async () => {
            const { name, symbol } = validateCoinDetails(String(body.name ?? ""), String(body.symbol ?? ""));
            return buildCreateInstructions({
              mint,
              creator,
              name,
              symbol,
              uri: validateMetadataUri(String(body.uri ?? "")),
            });
          })()
        : await buildFeeShareInstructions({ mint, creator });

    const connection = getLaunchConnection();
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const payload: LaunchPrepareResponse = {
      tx: serializeUnsignedTx(ixs, creator, blockhash),
      blockhash,
      lastValidBlockHeight,
      mint: mint.toBase58(),
      sweepWallet: sweepWallet.toBase58(),
      protocolWallet: protocolWallet.toBase58(),
      shareBps: FEE_SHARE_BPS,
    };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not build launch transaction.";
    const status = /required|invalid|not a valid|must be|Set NEXT_PUBLIC/i.test(message) ? 400 : 500;
    return jsonError(message, status);
  }
}
