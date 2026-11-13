// src/vendor/decent-head/2.0.0/js/config.js
var defaults = {
  version: "2.0.0",
  appName: "DecentHead",
  subtitle: "Your dapp. Your data. Your wallet.",
  enableIPFS: true,
  theme: {},
  art: { ipfsIcon: null, titleIcon: null, walletIcon: null, titleEnds: ["::-", "-::"] },
  ens: { enabled: true, rpcUrl: "https://ethereum-rpc.publicnode.com" },
  chain: {
    chainId: 8453,
    chainName: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://basescan.org"]
  },
  providers: {
    default: "pinata",
    pinata: { uploadUrl: "https://api.pinata.cloud/pinning/pinFileToIPFS" },
    local: { apiUrl: "http://127.0.0.1:5001" },
    gateway: "https://ipfs.io/ipfs/",
    ucanAuth: null
  },
  about: { title: "About DecentHead", summary: "The customizable web3 head for Decent dapps.", sections: [] },
  links: [],
  relatedDapps: [],
  supporterDnft: null
};
var plain = (value) => value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
function mergeConfig(base, override = {}) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (["__proto__", "constructor", "prototype"].includes(key) || value === void 0) continue;
    result[key] = plain(value) && plain(base[key]) ? mergeConfig(base[key], value) : value;
  }
  return result;
}
var config = mergeConfig(defaults, globalThis.DECENT_CONFIG);

// src/vendor/decent-head/2.0.0/js/wallet-logic.js
function chainParams(chain) {
  const id = BigInt(chain.chainId);
  if (id <= 0n) throw new Error("chainId must be positive");
  const chainId = `0x${id.toString(16)}`;
  return { switchParams: [{ chainId }], addParams: [{
    chainId,
    chainName: chain.chainName,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls,
    blockExplorerUrls: chain.blockExplorerUrls
  }] };
}
function discoverProvider(providers, detail) {
  if (!detail?.provider || typeof detail.provider.request !== "function" || !detail.info || typeof detail.info.uuid !== "string" || !detail.info.uuid || typeof detail.info.name !== "string") return providers;
  if (providers.some((entry) => entry.info.uuid === detail.info.uuid || entry.provider === detail.provider)) return providers;
  return [...providers, { info: { ...detail.info }, provider: detail.provider }].sort((a, b) => Number(b.info.rdns === "io.metamask") - Number(a.info.rdns === "io.metamask"));
}
async function switchChain(provider, chain) {
  const { switchParams, addParams } = chainParams(chain);
  if (BigInt(await provider.request({ method: "eth_chainId" })) === BigInt(chain.chainId)) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: switchParams });
  } catch (error) {
    if (Number(error.code ?? error.data?.originalError?.code) !== 4902) throw error;
    await provider.request({ method: "wallet_addEthereumChain", params: addParams });
    await provider.request({ method: "wallet_switchEthereumChain", params: switchParams });
  }
  if (BigInt(await provider.request({ method: "eth_chainId" })) !== BigInt(chain.chainId)) {
    throw new Error("Wallet did not switch to the configured chain");
  }
}

// src/vendor/decent-head/2.0.0/js/wallet.js
var ethersPromise;
function loadEthers() {
  if (globalThis.ethers) return Promise.resolve(globalThis.ethers);
  return ethersPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL("./vendor/ethers.umd.min.js", new URL("vendor/decent-head/2.0.0/js/wallet.js", document.baseURI).href).href;
    script.onload = () => resolve(globalThis.ethers);
    script.onerror = () => {
      ethersPromise = null;
      reject(new Error("Could not load ethers"));
    };
    document.head.append(script);
  });
}
var emit = (detail) => window.dispatchEvent(new CustomEvent("decenthead:wallet", { detail }));
var WalletSession = class {
  constructor({ lookupName } = {}) {
    this.lookupName = lookupName || (async (address) => (await import("./ens-Q65FYMGP.js")).lookupWalletName(address));
    this.identityRequest = 0;
    this.providers = [];
    this.state = { connected: false, address: null, chainId: null, provider: null, ensName: null, ensStatus: "idle" };
    this.generation = 0;
    this.announce = (event) => {
      this.providers = discoverProvider(this.providers, event.detail);
      window.dispatchEvent(new CustomEvent("decenthead:providers"));
    };
    window.addEventListener("eip6963:announceProvider", this.announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }
  available() {
    if (this.providers.length) return this.providers;
    return window.ethereum ? [{ info: { name: window.ethereum.isMetaMask ? "MetaMask" : "Browser wallet", uuid: "fallback" }, provider: window.ethereum }] : [];
  }
  snapshot() {
    return { ...this.state };
  }
  async connect(provider = this.available()[0]?.provider) {
    if (!provider) throw new Error("No injected wallet. Open this page in a wallet browser.");
    this.forget();
    const generation = this.generation;
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    if (!accounts?.length) throw new Error("Wallet returned no accounts");
    await switchChain(provider, config.chain);
    const ethers = await loadEthers();
    const chainId = await provider.request({ method: "eth_chainId" });
    if (generation !== this.generation) return;
    this.rawProvider = provider;
    this.browserProvider = new ethers.BrowserProvider(provider, "any");
    this.state = { connected: true, address: accounts[0], chainId, provider: this.browserProvider, ensName: null, ensStatus: "idle" };
    this.handlers = {
      accountsChanged: (accounts2) => {
        if (!accounts2.length) {
          this.forget();
          return;
        }
        this.state = { ...this.state, address: accounts2[0], ensName: null, ensStatus: "idle" };
        emit(this.snapshot());
        void this.resolveIdentity();
      },
      chainChanged: (chainId2) => {
        this.browserProvider = new ethers.BrowserProvider(provider, "any");
        this.state = { ...this.state, chainId: chainId2, provider: this.browserProvider };
        emit(this.snapshot());
      },
      disconnect: () => this.forget()
    };
    for (const [event, handler] of Object.entries(this.handlers)) provider.on?.(event, handler);
    emit(this.snapshot());
    void this.resolveIdentity();
    return this.snapshot();
  }
  async resolveIdentity() {
    const request = ++this.identityRequest, address = this.state.address;
    if (!address || !config.ens.enabled) return;
    this.state = { ...this.state, ensStatus: "loading" };
    emit(this.snapshot());
    try {
      const ensName = await this.lookupName(address);
      if (request !== this.identityRequest || address !== this.state.address) return;
      this.state = { ...this.state, ensName, ensStatus: ensName ? "resolved" : "not-found" };
    } catch (error) {
      if (request !== this.identityRequest || address !== this.state.address) return;
      this.state = { ...this.state, ensName: null, ensStatus: "unavailable" };
      console.warn("[DecentHead ENS] Name lookup failed:", error.message);
    }
    emit(this.snapshot());
  }
  async ensureChain(chain = config.chain) {
    if (!this.rawProvider) throw new Error("Connect a wallet first");
    const provider = this.rawProvider, generation = this.generation;
    await switchChain(provider, chain);
    const ethers = await loadEthers();
    const chainId = await provider.request({ method: "eth_chainId" });
    if (generation !== this.generation) throw new Error("Wallet session changed; retry the action");
    this.browserProvider = new ethers.BrowserProvider(provider, "any");
    this.state = { ...this.state, chainId, provider: this.browserProvider };
    emit(this.snapshot());
    return this.browserProvider;
  }
  forget(notify = true) {
    this.generation++;
    this.identityRequest++;
    for (const [event, handler] of Object.entries(this.handlers || {})) this.rawProvider?.removeListener?.(event, handler);
    this.handlers = null;
    this.rawProvider = null;
    this.browserProvider = null;
    this.state = { connected: false, address: null, chainId: null, provider: null, ensName: null, ensStatus: "idle" };
    if (notify) emit(this.snapshot());
  }
};
var wallet = typeof window === "undefined" ? null : new WalletSession();

export {
  config,
  loadEthers,
  WalletSession,
  wallet
};
