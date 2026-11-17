# Supporter reward-slot funding

The reward-plan token at `tokens[0]` is the pickup on level 9 or 10; `tokens[1]`
is the later pickup on level 17, 18, or 19. The server rotation, signed ticket
validator, replay validator, browser vault, and capture verifier all enforce the
same slot-specific candidate sets.

DHearse v0.1.1 is Base token **81** in the existing DecentNFT collection.
Exactly **10 editions** were transferred to VoyagerRewards at
`0xCa55A59BD2c15D0F11Ae5f7e7E96Bb58eb0B7DE5`, in transaction
`0x0cc3e30a261a27d8d7e59739ffc9dbeb0ab931b9e6a6412e8a36a8d1bc5a65b1`.
Receipt, balance, and release evidence are recorded in
[`dhearse-v0.1.1.json`](../contracts/deployments/dhearse-v0.1.1.json).
The other 990 editions were listed at 10 USDC as listing 21. These are verified
historical snapshots; live inventory still gates vouchers.

DHearse is in `LEVEL_9_10_PRIZES` only. It never enters the level 17-19 slot.
Its catalog uses the exact release metadata, original front artwork and
the A-Decent-Agency repository rather than assuming a personal repository.

Deploy the updated referee before the matching frontend. Old frontends cannot
replay a new plan containing token 81; already-issued plans containing the
older tokens remain valid. Do not announce this as live gameplay until both
deployments use this catalog.

For future releases:

1. Add the exact entry and verified metadata URI to the Supporter
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
represent a minted or funded asset. The tests also exercise the real DHearse
token through a deterministic early capture, replay, and mocked voucher issuer;
they do not execute or promise a player's on-chain claim.
