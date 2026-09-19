export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  items: number;
  owners: number;
  floorSol: number;
  listed: number;
  change24h: number;
  volume7d: number;
  coinsPaired: number;
  sweeps24h: number;
  solSwept: number;
  cover: string;
  files: string[];
  nftFiles: string[];
  sweepWallet: string;
};

export type Coin = {
  mint: string;
  name: string;
  ticker: string;
  tagline: string;
  collectionSlug: string;
  image: string;
  mcapUsd: number;
  volume24hUsd: number;
  change24h: number;
  feesSweepSol: number;
  bondingPct: number;
  graduated: boolean;
  pumpUrl: string;
  dexscreenerUrl: string;
};

export type SweepReceipt = {
  id: string;
  collectionSlug: string;
  collectionName: string;
  image: string;
  tokenName: string;
  solPaid: number;
  floorAtBuy: number;
  buyTx: string;
  burnTx?: string;
  wallet: string;
  mint: string;
  held: boolean;
  sweptAt: string;
  demo: boolean;
};
