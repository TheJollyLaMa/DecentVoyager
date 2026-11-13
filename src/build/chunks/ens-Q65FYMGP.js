import {
  config,
  loadEthers
} from "./chunk-MGKXGFKW.js";

// src/vendor/decent-head/2.0.0/js/ens.js
var mainnet;
async function lookupWalletName(address) {
  const { JsonRpcProvider, FetchRequest } = await loadEthers();
  if (!mainnet) {
    const request = new FetchRequest(config.ens.rpcUrl);
    request.timeout = 8e3;
    mainnet = new JsonRpcProvider(request, 1, { staticNetwork: true });
  }
  const name = await mainnet.lookupAddress(address);
  if (!name) return null;
  const resolved = await mainnet.resolveName(name);
  return resolved?.toLowerCase() === address.toLowerCase() ? name : null;
}
export {
  lookupWalletName
};
