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

On 2026-11-12, the existing `voyager.decentagency.eth.limo` site returned
`frame-ancestors 'self'` CSP, HTML and JavaScript MIME types, and CORS `*`.
Chromium on that origin reached Base `eth_chainId` and referee `/health`;
an unauthenticated Pinata upload was rejected with HTTP 401 as expected.
This tests gateway/service compatibility on the old ENS content, not a new pin
or a successful authenticated backup.

## Candidate pin and remaining gate

The bundled frontend at commit `7fc92dcf2328cd3fae344843eb1fe41511d140c9`
was pinned as
`bafybeic22j6kj4g4qgqia456mjztjxvxj2r5t5ax2sf6mjg3hofswoanca` (182 files).
The index, configuration, game bundle, shell entry, core/radio chunks and CSS
were retrieved from Filebase and matched the commit's SHA-256 bytes. This is a
**candidate**, not an accepted IPFS rollout. A fresh Chromium load on Filebase
hit HTTP 429 for the launch-reminder chunk and displayed the intended retry
fallback; its self-only CSP also blocked the Base RPC, referee and Pinata
requests. Do not select Filebase as the app-serving gateway.

The current Ethereum resolver readback still serves the previous CID
`bafybeib2gcanocvsn672opkxewptwrv37gfxfhtdu2g7nbpkddlwqe6amu`.
The existing ENS `.eth.limo` origin passed the service probes above, but has
not served the new candidate and cannot establish its full-app acceptance.
The [prepared steward signing page](https://thejollylama.github.io/DecentHead/supporter/ens.html?name=voyager.decentagency.eth&cid=bafybeic22j6kj4g4qgqia456mjztjxvxj2r5t5ax2sf6mjg3hofswoanca&repo=TheJollyLaMa%2FDecentVoyager&version=7fc92dcf)
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
