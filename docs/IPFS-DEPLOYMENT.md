# IPFS frontend acceptance

The current Filebase gateway returned `text/html` and CORS `*` for the
previous pinned index on 2026-11-12, but its CSP is `default-src 'self'`
without a `connect-src` override. That is not sufficient for the external
RPC, referee, pinning and radio services. `ipfs.io` and the tested dweb.link
subdomain returned HTTP 429 on the same date; this does not establish a
supported replacement gateway. These observations can change.

The checked-in shell bundle is generated with `npm ci && npm run build:shell`;
Pages checks that it matches the source before deploying. It keeps shared
module identity and source-relative asset URLs and isolates the optional radio
bundle. The Playwright shell test limits startup to six script requests with
an injected mock wallet, verifies
the About/IPFS dialogs, and injects core, loader and radio failures. A fallback
links to retry and Pages. This alone does not establish a gateway rollout.
Game artwork starts after a short grace period and loads at most three images
at a time; missing images still use the existing vector fallback. This keeps
the game preloader from issuing the entire asset manifest ahead of the header.

On 2026-11-12, the existing `voyager.decentagency.eth.limo` site returned
`frame-ancestors 'self'` CSP, HTML and JavaScript MIME types, and CORS `*`.
Chromium on that origin reached Base `eth_chainId` and referee `/health`;
an unauthenticated Pinata upload was rejected with HTTP 401 as expected.
This tests gateway/service compatibility on the old ENS content, not a new pin
or a successful authenticated backup.

## Candidate pin and remaining gate

The bundled frontend at commit `a69453fcb80c3722691c89894691f4aedc34cb60`
was pinned as
`bafybeicefiheqclchbu5d24baedp4k65cckzx2wi6tcqmtjryz7x6sf4qa` (176 files).
The index, configuration, game bundle, shell entry, core/radio bundles and
both CSS files were retrieved from Filebase and matched the commit's SHA-256
bytes. A fresh Chromium app check loaded the wallet, menus, About, IPFS dialog
and game with six script requests and no failed requests. However, the
gateway's self-only CSP blocked the Base RPC, referee and Pinata service
probes. This is a **candidate**, not an accepted IPFS rollout; do not select
Filebase as the app-serving gateway.

Pages deployment
[43442469928](https://github.com/TheJollyLaMa/DecentVoyager/actions/runs/43442469928)
of the same source commit succeeded. A fresh desktop app check passed with six
script requests; the mobile-emulated control smoke passed on retry after one
portrait horizontal-overflow assertion failed. This is not physical-device
evidence or a fully reliable mobile acceptance result.

The current Ethereum resolver readback still serves the previous CID
`bafybeib2gcanocvsn672opkxewptwrv37gfxfhtdu2g7nbpkddlwqe6amu`.
The existing ENS `.eth.limo` origin passed the service probes above, but has
not served the new candidate and cannot establish its full-app acceptance.
The [prepared steward signing page](https://thejollylama.github.io/DecentHead/supporter/ens.html?name=voyager.decentagency.eth&cid=bafybeicefiheqclchbu5d24baedp4k65cckzx2wi6tcqmtjryz7x6sf4qa&repo=TheJollyLaMa%2FDecentVoyager&version=a69453fc)
is **not authorization to sign before the gateway acceptance below**.
No ENS transaction has been submitted.

`tests/gateway-app.browser.mjs` accepts `VOYAGER_GATEWAY` for a fresh-context
app and dialog check with a mock injected wallet;
`tests/gateway-services.browser.mjs` probes external services without wallet
interaction. Neither sends a wallet transaction.

Before any IPFS rollout, use a fresh-cache browser on a selected gateway:

1. Verify HTML and JavaScript MIME, gateway CSP and CORS, and every required
   external-service request. Do not weaken browser security.
2. Verify wallet, title, both menus, About and IPFS progress dialogs, game and
   radio (or its explicit unavailable state). Inject core and radio failures.
3. Exercise RPC, referee and pinning with valid public inputs; preserve honest
   failures. Verify listing 19, retired listing 18 migration and 10 USDC
   without initiating a purchase or wallet request.
4. Repeat on GitHub Pages. The steward waived physical-phone acceptance on
   2026-11-12; emulation is not a physical-device test. Record source commit,
   gateway, browser evidence and successful exact pin.
5. Only after full acceptance may the authorized ENS steward sign the update;
   independently read back the resolver and contenthash. Do not report the
   game canvas alone or a pin-byte match as full-app acceptance.
