# Floorfi — Full Product Build Prompt

Give this to a coding agent. Build the complete Floorfi web app from this spec. Do not clone BIDDY’s visual brand; use Floorfi’s identity below. BIDDY is a product-category reference only (fee → floor-sweep mechanic).

---

## Mission

**Floorfi** is the Solana launchpad where every memecoin is paired with an NFT collection — and **creator fees mop the floor**.

Tagline options (pick one for UI):
- “Memecoins that mop the floor.”
- “Trade the coin. Sweep the collection.”
- “Floor goes down. Culture goes up.”

One-liner: Launch a coin, lock an 80/20 fee split, and watch a public sweep wallet buy the paired NFT collection at floor — every purchase verified on Solscan.

---

## Product rules (non-negotiable)

1. **Pair required** — No coin launches without a Solana NFT collection selected.
2. **Fee split locked** — At launch: 80% → collection sweep wallet, 20% → Floorfi protocol. Split is set via pump.fun fee-share config and admin revoked so it cannot change.
3. **Public sweep wallet** — One sweep wallet per collection. All buys are on-chain; UI shows Solscan links, never “trust us.”
4. **Receipts or it didn’t happen** — Sweep gallery only shows NFTs with purchase tx + mint + wallet, read from chain / indexer.
5. **Creator stays creator** — User is the on-chain pump.fun creator. Floorfi never holds fee authority.
6. **No fake floors** — Floor prices from Magic Eden / Tensor APIs (live). Show timestamp “updated Xs ago.”
7. **Anti-goal** — Do not build a generic memecoin launcher. Do not hide fees. Do not invent swept NFTs for demo without marking them as mock.

---

## Core user flows

### A. Home / Discover
- Hero: tagline + live counters (coins launched, collections, NFTs swept, SOL swept).
- “Floors right now” ranked table (collection, floor SOL, listed count, coins paired).
- Recent sweeps strip (NFT thumb + collection + SOL paid + tx chip).
- CTA: **Launch a Floorfi coin**.

### B. Launch
Steps:
1. Connect wallet (Phantom / Solflare).
2. Pick collection (search + floor + image).
3. Name, ticker, image upload (or AI generate).
4. Preview fee split (80% sweep / 20% protocol) — immutable callout.
5. Sign create → sign fee-share update → done.
6. Success screen: DexScreener link, pump.fun link, sweep wallet address, share cards.

### C. Collection page
- Floor chart / current floor.
- Paired coins list (mcap, 24h vol, fees generated → sweep).
- Sweep wallet balance + NFT holdings.
- Receipt feed for that collection only.

### D. Coin page
- Bonding / graduated status.
- Fees accrued → estimated floors/week calculator (volume slider).
- Link to paired collection + DexScreener embed or deep link.
- Share / promo image generator (Open Graph).

### E. Sweep gallery (global)
- Grid of swept NFTs with filters (collection, date, burned vs held).
- Each card: image, collection, buy tx, optional burn tx, SOL amount.

### F. Analytics
- Protocol SOL swept (7d / 30d / all).
- Top collections by sweep volume.
- Top coins by fees routed.
- Transparent methodology blurb.

---

## Design system (Floorfi brand — implement exactly)

### Personality
Clean dark terminal meets meme chaos. Confident, slightly smug, never corporate SaaS purple. Think “janitor of Solana NFT floors.”

### Color
| Token | Hex | Use |
|-------|-----|-----|
| `void` | `#07080C` | Page background |
| `ink` | `#0E1018` | Cards / panels |
| `line` | `#1C2030` | Borders |
| `fog` | `#8B93A7` | Secondary text |
| `snow` | `#F4F6FB` | Primary text |
| `mop` | `#3DFF9A` | Primary accent (action, success, “swept”) |
| `mop-dim` | `#1FA864` | Hover / charts |
| `warn` | `#FFB020` | Pending / bonding |
| `hot` | `#FF4D6A` | Alerts / dumps |
| `sol` | `#9945FF` | Solana soft accent (sparingly) |

### Typography
- Display / headlines: **Space Grotesk** (or similar geometric sans), weight 600–700.
- Body / UI: **Inter**.
- Mono / addresses / tx: **JetBrains Mono**.
- Never use Inter for the wordmark.

### Wordmark & mark
- Wordmark: **floorfi** lowercase, Space Grotesk Bold, `snow`.
- Mark: rounded square with a stylized mop / broom head forming an “F” negative space; mop glow in `mop` green on `void`.
- Favicon: mark only at 32 / 180 / 512.

### UI chrome
- Cards: 16px radius, 1px `line` border, subtle inner highlight.
- Primary button: `mop` fill, `void` text, pill or 12px radius.
- Secondary: ghost border `line`, text `snow`.
- Chips for tx hashes: mono, truncate middle, copy on click.
- Motion: short (150–250ms), mop accent flash on successful sweep toast.

### Imagery
- NFT images from `/nft-images` (or CDN). Always show collection + floor badge over image.
- Empty states: mop illustration + “Nothing on the floor yet.”

---

## Tech stack (recommended)

- **Next.js 14+** (App Router) + TypeScript
- **Tailwind** + CSS variables for brand tokens
- **@solana/web3.js** + wallet-adapter
- **pump.fun** create + fee-share instructions (match current program IDs; verify on-chain)
- Indexer: Helius / Shyft / custom for sweep wallet txs
- Floor data: Magic Eden API + Tensor fallback
- Charts: lightweight-charts or recharts
- Deploy: Vercel

Env (document in `.env.example`):
```
NEXT_PUBLIC_RPC_URL=
HELIUS_API_KEY=
MAGIC_EDEN_API=
NEXT_PUBLIC_PROTOCOL_FEE_WALLET=
```

---

## Information architecture / routes

```
/                 Home + live floors + recent sweeps
/launch           Launch wizard
/collections      All collections with Floorfi coins
/collections/[slug]
/coin/[mint]
/sweeps           Global gallery
/analytics
/docs             How fee split + sweep works (plain English)
```

---

## Implementation phases

### Phase 1 — Shell & brand
- Layout, nav, design tokens, wordmark placeholder, dark theme.
- Static home with mock counters + floor table using local `/nft-images` + `collections.json`.

### Phase 2 — Collections & gallery
- Collection pages, NFT image grid, mock receipts marked “demo data”.
- Wire Magic Eden floors when API key present; graceful mock fallback.

### Phase 3 — Launch wizard UI
- Full wizard UX with wallet connect; simulate signatures in dry-run mode.
- Fee-split explainer component (locked 80/20).

### Phase 4 — On-chain
- Real pump.fun create + fee shares.
- Sweep wallet watcher → persist receipts → gallery.

### Phase 5 — Analytics + share
- Protocol stats, OG image for coins, DexScreener deep links.

---

## Acceptance criteria

- [ ] Brand colors/type match this doc (no Hyped/BIDDY clone look).
- [ ] Launch flow cannot proceed without a collection.
- [ ] Fee split UI always shows 80% sweep / 20% protocol as locked.
- [ ] Sweep gallery cards include purchase tx links when real data exists.
- [ ] ≥100 NFT/collection images load in UI without broken images.
- [ ] Mobile usable (launch + floors + sweeps).
- [ ] Docs page explains mechanic in plain language.
- [ ] README: run locally, env vars, dry-run vs mainnet.

---

## Copy bank (use as-is)

- Hero: “Memecoins that mop the floor.”
- Sub: “Pair your coin with a collection. Lock the fee split. Every trade helps buy the floor — on chain, in public.”
- CTA primary: “Launch on Floorfi”
- CTA secondary: “See sweeps”
- Toast success: “Floor mopped.”
- Empty sweeps: “Floor’s still dirty. Be the first coin.”

---

## Anti-goals

- No cloning BIDDY / Hyped visuals or copy verbatim.
- No custodial fee claiming by Floorfi.
- No pay-to-rank collections without disclosure.
- No fake “swept” NFTs in production mode.

---

## Deliverables for the agent

1. Working Next.js app with routes above.
2. Design tokens + components matching brand.
3. Launch wizard (dry-run + mainnet flag).
4. Collections + sweeps fed by `nft-images/` + JSON, then live APIs.
5. README + `.env.example`.

Build Floorfi. Make the floor regret existing.
