# Victory stamps (Base)

Every cleared level becomes a local Flight Logs record (up to 200), independent of wallet connection. Open the first right-ankh menu entry for saved lifetime stats (including failed flights), organized combat/cargo telemetry and recent rendered battle cards. Opening Flight Logs pauses active local flight; closing with the x/backdrop or Escape leaves it paused. Browser storage is not a backup: keep the game save and copy submitted claims.

## Player flow

Every cleared level remains in local Flight Logs, independent of wallet connection. Wallet stamping, voucher claims, supporter prizes, and online paid rounds are gated to Decent Pilots (a whitelisted entry with a wallet address). This is only a browser convenience check: the referee and contracts enforce eligibility. Cadet has 10 free levels; Pilot/Ace have 20 with or without a wallet.

For Decent Pilots, the preferred automatic queue flow is:

1. While a Decent Pilot is connected on the title screen, the browser requests a flight ticket from `POST /tickets` and gives its seed and ticket/MAC to the game. This requires no wallet signature. Tickets are refreshed on wallet changes, expiry, and run starts.
2. On capture, choose **Collect to wallet** in the presentation, or **Sign & collect rewards** at game over/victory. The same action sequences an EIP-191 evidence signature and a Base transfer approval; you pay Base gas. Nothing signs on wallet connection or pickup. The browser posts `{ address, run, signature }` to `/captures` for a guarded mid-level checkpoint or `/runs` for a completed flight. Both contain the original ticket/MAC and seed.
3. The referee verifies the pilot and deterministically replays the signed inputs. Guarded captures may receive their own replay-derived capture receipt before the level clears. Each later checkpoint and final log must preserve the earlier signed input prefix, ticket, wallet and campaign identity. Queue reservations reuse the first voucher for the same verified capture, not another funded unit. Level-20 and perfect/marathon awards still require their existing verified completion records and conditions. Signed requests remain in the local outbox on service failure; background retries verify only and never send wallet transactions.
4. The explicit collection action submits `VoyagerRewards.claim` (atomic NFT/bonus bundle), `VoyagerStamps.mintWithVoucher`, or a previously issued `VoyagerPrizes.claim`. No extra redemption menu or native confirmation is needed. **☥ → Flight Logs** contains actual Supporter artwork, description and project/Canopy/metadata/Base links, unsigned saved checkpoints, pending verification errors and past vouchers from `GET /vouchers/:address`. Collect there later with the same wallet. Submitted hashes survive reload and are receipt-checked before retry; collection is confirmed on Base, never inferred from signing. The collected label is transfer history, not a current-balance assertion. Expired tickets/vouchers and unavailable artwork or services remain explicit.

Deploy the referee's `/captures` API before this frontend. The gameplay ruleset and deployed contracts are unchanged. This update adds wallet-scoped browser reward history (`decent-voyager-rewards/1`) and preserves the original signed outbox, including older-ruleset requests. Browser history is not an IPFS backup; keep it until pending verification/transfers resolve. Approved wallet transactions are not performed by automated validation.

The GitHub issue flow remains a fallback when a pilot needs to submit a claim manually or the referee cannot be used. Open **☥ profile → Flight Logs**, connect your own wallet using the header fox, and use **Stamp DNFT**, **Request mint on GitHub**, or **Copy claim JSON**. Flight Logs never requests accounts automatically. The GitHub issue form must actually be submitted; a prepared request is not accepted, minted, or paid. The existing trusted workflow validates/deduplicates the request into `victory-stamps.json`; the owner reviews it and batches it on Base. This legacy path requires the DecentHead IPFS session and remains subject to explicit user/provider action.

Metadata is ERC-1155/OpenSea-shaped: name, description, `ipfs://` image, external URL, leaf attributes for **all** stats, score and ship values (including nested weapon/pickup counters), level/name/difficulty, seed/start/duration, and completedAt as Unix seconds (`display_type: date`). `properties.record` preserves the complete JSON-safe LevelRecord, including the bounded battle log, schema, game/version, claimant and Base identity. `null` statistics become an “Unavailable” attribute while the raw record retains null.

IPFS and GitHub expose these records publicly, including wallet address and ship path. Pinning acceptance is not a retention guarantee. The legacy GitHub issue flow is user-submitted and owner-reviewed; the signed referee flow verifies the wallet signature and deterministically replays the run, but remains dependent on the configured referee and contract deployment.

## Owner admin flow

The LEFT ankh Admin entry is visible only to the configured connected wallet and displays the outstanding-item count after login. Tabs are **Victory Stamps**, **Supporter Prizes**, **Arena Rounds**, and **Decent Pilots**. `?adminPreview=1` enables a read-only preview; transaction controls are disabled. ENS names and avatars are optional, cached mainnet reverse lookups. UI gating is convenience, never contract authorization.

The queue and contributor/payroll ledgers load from this repository's raw `main` files, then public static copies under `src/` for local/offline fallback. The root ledgers remain canonical; update their site copies when preparing a release. A missing ledger explicitly says unavailable. The victory queue also supports JSON paste/import.

Review the issue and load every metadata stat before selecting 1–20 stamps. Metadata must match claimant, image, record ID, level, difficulty, date and score. The legacy victory-stamp mint path checks Base 8453, deployed batch selector, configured admin's DEFAULT_ADMIN_ROLE, and signer identity; estimates gas with a bounded 20% margin; and asks for explicit confirmation before the wallet transaction. Supporter releases show the full batch and require explicit confirmation. They first simulate escrow `withdrawNFT` deposits into VoyagerPrizes; after inventory is confirmed, reload to simulate and confirm `adminRelease` calls. Every product fixes recipient to claimant, amount/maxSupply to 1, and royalties to the configured admin. Only exact matching TokenRegistered and EditionMinted receipt events produce a mint export.

**Copy confirmed export** produces `{ "minted": [...] }`. In an owner-reviewed PR, remove those records from `pending` and append them to `minted` in `victory-stamps.json`; do not duplicate them across sections. Keep transaction hash, token ID, contract and chain fields. The browser cannot write GitHub. A local transaction journal locks uncertain and confirmed batches against accidental re-minting. Confirmed locks release only after the public main ledger contains the matching export. For a pending/uncertain operation, use receipt check or recover its original/replacement hash from wallet history; recovery requires the exact same owner, contract and batch calldata. Never clear storage to retry an uncertain mint. If recovery is unavailable, review wallet history and the chain manually with the owner.

## Configuration and verification

Set public overrides **before modules load**:

```js
window.DECENT_CONFIG = {
  ...window.DECENT_CONFIG,
  voyager: {
    refereeUrl: 'https://your-referee.example', chainId: 8453, testnetChainId: 84532,
    contracts: { addressesUrl: './js/chain/addresses.json' }
  },
  asteroid: {
    adminWallet: '0x807061DF657A7697c04045dA7d16D941861cAABc',
    contractAddress: '0x64D5aDc50E5513975EfF7e9ba366B7eE58586fa3',
    royaltyFeeBps: 500,
    gateway: 'https://ipfs.io/ipfs/'
  }
};
```

The public Voyager defaults are in `src/decent-head.config.js`; admin compatibility settings remain in `src/js/admin/config.mjs`. The default address is the existing DecentBusking DNFT collection, **not** a newly deployed dedicated Voyager collection. The owner must approve sharing it or configure another verified compatible collection; no deployment was performed by this legacy admin workflow. No private keys belong here. Gateway and contract overrides must be reviewed for privacy/runtime compatibility. The SDK is DecentHead's existing vendored ethers, loaded only when needed.

On 2026-11-05, **read-only** RPC to `https://mainnet.base.org` verified deployed code at the default address (11,525 bytes) containing selector `0x04491a20` for `registerAndMintProductsBatch((address,uint256,uint256,string,address,uint96)[])`. `hasRole(bytes32(0), admin)` returned true; `hasRole(keccak256("MINTER_ROLE"), admin)` returned false. Empty batch `eth_call` from admin returned `EmptyProductBatch()` (`0xa49ae4d8`), while another wallet returned `AccessControlUnauthorizedAccount` for DEFAULT_ADMIN_ROLE. A nonempty one-product **staticCall** from admin returned token ID 200 in simulation; **nothing was minted**. Product batches require DEFAULT_ADMIN_ROLE, not MINTER_ROLE. Runtime checks run again for every real batch; if code/role/RPC is unavailable, minting fails closed with an unverified/unavailable message.

Source inspected: DecentMarket `contracts/DecentNFT_v0.3.sol` and `DecentNFT_v0.2.sol` at `2942cf84692bc6752039b68fb425711703fe4927`. Roles can change. This confirms the batch interface/authorization behavior, not a full contract audit or deployment/source byte-for-byte verification.
