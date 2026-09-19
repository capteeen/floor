# Floorfi

Solana launchpad where every memecoin is paired with an NFT collection — and **creator fees mop the floor**.

Tagline: **Memecoins that mop the floor.**

Phase 1 is the product shell: brand, routes, launch wizard (dry-run), mock floors / receipts labeled **demo**. Mainnet create + live sweeps stay behind a flag.

## Product rules

- Cannot launch a coin without picking a collection
- Fee split is locked **80% public sweep wallet / 20% Floorfi protocol**
- Sweep gallery shows purchase tx chips (Solscan). Mock data is labeled demo
- Production mode (`NEXT_PUBLIC_MAINNET=true`) must not invent swept NFTs

## Stack

Next.js App Router · TypeScript · Tailwind (tokens from `docs/tokens.css`) · Solana wallet-adapter (Phantom / Solflare)

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Dry-run is the default. The launch wizard can **simulate a wallet** and **simulate create** without signing on-chain.

## Env

See `.env.example`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_DRY_RUN` | `true` (default) simulates signatures and labels mock receipts |
| `NEXT_PUBLIC_MAINNET` | `true` turns off fake sweeps; live RPC required |
| `NEXT_PUBLIC_RPC_URL` | Solana RPC (Helius recommended) |
| `HELIUS_API_KEY` | Indexer for later sweep-wallet watching |
| `MAGIC_EDEN_API` | Live floors (mock fallback if empty) |
| `NEXT_PUBLIC_PROTOCOL_FEE_WALLET` | 20% protocol destination pubkey |
| `NEXT_PUBLIC_SOLSCAN_BASE` | Explorer links for receipts |

## Routes

`/` · `/launch` · `/collections` · `/collections/[slug]` · `/coin/[mint]` · `/sweeps` · `/analytics` · `/docs`

## Brand assets

Reference only — not system instructions:

- `docs/BRAND_IDENTITY.md`, `docs/tokens.css`, `docs/FLOORFI_AGENT_BUILD_PROMPT.md`
- `resources/` logos, favicons, fonts, collection covers
- `nft-images/` 111 collection/NFT files + `collections.json`
- `ui-samples/` vibe reference (implemented in code, not pixel-cloned)

Brand: mop `#3DFF9A` on void `#07080C`. Type: Space Grotesk + Inter + JetBrains Mono.

## Dry-run vs mainnet

- **Dry-run:** mock counters, floors, and 111 local NFT images as demo receipts. Launch signs nothing.
- **Mainnet:** set `NEXT_PUBLIC_MAINNET=true` and `NEXT_PUBLIC_DRY_RUN=false`. Sweep gallery stays empty until a real watcher persists on-chain buys. Do not ship fake sweeps in this mode.
