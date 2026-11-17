# Supporter reward-slot funding

The reward-plan token at `tokens[0]` is the pickup on level 9 or 10; `tokens[1]`
is the later pickup on level 17, 18, or 19. The server rotation, signed ticket
validator, replay validator, browser vault, and capture verifier all enforce the
same slot-specific candidate sets.

DHearse has not yet been minted. Its token ID is intentionally absent from
both candidate sets and the public supporter catalog. Do not guess an ID or
describe the Voyager reward as funded. After the Supporter release is verified:

1. Add the exact DHearse entry and verified metadata URI to the Supporter
   catalog and `LEVEL_9_10_PRIZES` in `src/js/prizes.js`. Do not add it to
   `LEVEL_17_19_PRIZES`.
2. Verify the Voyager Rewards contract and its role/address from current
   deployment evidence. Transfer exactly ten editions of that token ID into
   the verified reward contract through the approved signer workflow.
3. Check the transaction receipt and the contract's `balanceOf` inventory.
   Only then report the ten editions as funded or enable the DHearse candidate.
4. Run `node --test server/test/reward-rotation.test.js`, the replay/capture
   suites, and the receiving browser tests. Confirm the level 9/10 slot can
   choose DHearse, the later slot cannot, and a captured voucher matches the
   verified token ID and inventory.

The synthetic token ID used by the slot test is test-only and does not
represent a minted or funded asset. This repository change adds slot-aware
logic; it does not mint, transfer, reserve, or announce any Supporter editions.
