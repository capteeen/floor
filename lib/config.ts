export const FEE_SPLIT = {
  sweep: 80,
  protocol: 20,
} as const;

export const FEE_SHARE_BPS = {
  sweep: FEE_SPLIT.sweep * 100,
  protocol: FEE_SPLIT.protocol * 100,
} as const;

function envFlag(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

const mainnet = envFlag(process.env.NEXT_PUBLIC_MAINNET, false);
const dryRun = mainnet ? false : envFlag(process.env.NEXT_PUBLIC_DRY_RUN, true);

export const appConfig = {
  dryRun,
  mainnet,
  rpcUrl:
    process.env.NEXT_PUBLIC_RPC_URL ||
    (mainnet ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com"),
  protocolFeeWallet: process.env.NEXT_PUBLIC_PROTOCOL_FEE_WALLET || "",
  defaultSweepWallet: process.env.NEXT_PUBLIC_SWEEP_WALLET || "",
  solscanBase: process.env.NEXT_PUBLIC_SOLSCAN_BASE || "https://solscan.io",
  twitterUrl: "https://x.com/floorfi_onsol",
  twitterHandle: "@floorfi_onsol",
  feeSplit: FEE_SPLIT,
};

export function solscanTx(signature: string) {
  return `${appConfig.solscanBase}/tx/${signature}`;
}

export function solscanAddress(address: string) {
  return `${appConfig.solscanBase}/account/${address}`;
}
