# IPFS frontend acceptance

The current Filebase gateway returned `text/html` and CORS `*` for the
previous pinned index on 2026-11-12, but its CSP is `default-src 'self'`
without a `connect-src` override. That is not sufficient for the external
RPC, referee, pinning and radio services. `ipfs.io` and the tested dweb.link
subdomain returned HTTP 429 on the same date; this does not establish a
supported replacement gateway. These observations can change.

The shell now shows a persistent retry/Pages link if the core loader fails,
and handles a failed optional radio separately. This does **not** solve startup
request fan-out or validate the complete application. Do not repin or change
ENS based on the shell smoke test alone.

Before any IPFS rollout, use a fresh-cache browser on a selected gateway:

1. Verify HTML and JavaScript MIME, gateway CSP and CORS, and every required
   external-service request. Do not weaken browser security.
2. Verify wallet, title, both menus, About and IPFS progress dialogs, game and
   radio (or its explicit unavailable state). Inject core and radio failures.
3. Exercise RPC, referee and pinning with valid public inputs; preserve honest
   failures. Verify listing 19, retired listing 18 migration and 10 USDC
   without initiating a purchase or wallet request.
4. Repeat on GitHub Pages and, when available, a physical MetaMask phone.
   Record source commit, gateway, browser evidence and successful exact pin.
5. Only after full acceptance may the authorized ENS steward sign the update;
   independently read back the resolver and contenthash. Do not report the
   game canvas alone or a pin-byte match as full-app acceptance.
