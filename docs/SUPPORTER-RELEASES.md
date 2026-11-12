# Voyager Supporter releases

The pinned [DecentHead product kit](https://github.com/TheJollyLaMa/DecentHead/blob/main/docs/SUPPORTER-PRODUCTS.md)
prepares future published releases from the tracked `src/` static site. It uses
the default 1,000 editions and 10 USDC, subject to steward approval of the sale
route. The workflows submit no wallet transactions. Pin both workflow references
and both `head_ref` inputs to the same reviewed DecentHead commit.

The existing v1.0.0 token 80 and its frozen release are historical evidence.
Do not re-prepare, remint, re-list, or replace its manifest. The kit refuses to
prepare an already-frozen release. Review its release scan and delivery markers
before enabling announcements; legacy evidence must not be blindly registered.

Owner setup is still required: repository secrets `PINATA_JWT` and
`DISCORD_SUPPORTER_WEBHOOK`; after verifying them and the delivery state, set
`SUPPORTER_DISCORD_ENABLED=true`. `SUPPORTER_ENS_NAME` is
`voyager.decentagency.eth`, already listed in DecentCanopy's public inventory.
ENS and mint/list transactions require the respective authorized stewards.
Until a future release is prepared, signed and verified, installation is not an
end-to-end production acceptance.
