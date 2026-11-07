const ADDRESS = /^0x[\da-f]{40}$/i;
const BASE = { chainId: 8453, chainName: 'Base', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://mainnet.base.org'], blockExplorerUrls: ['https://basescan.org'] };
function contractAddress(book, name) {
  const values = book?.contracts || book || {};
  const value = values[name] || values[name[0].toLowerCase() + name.slice(1)] || values.base?.[name] || values['8453']?.[name];
  return typeof value === 'string' ? value : value?.address || null;
}
export async function rewardContract(entry, { wallet, ethers, fetchImpl = globalThis.fetch, address, readOnly = false } = {}) {
  if (!readOnly && !wallet?.snapshot?.().connected) throw new Error('Connect your Decent Pilot wallet with the header fox.');
  const response = await fetchImpl('./js/chain/addresses.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Claim contracts are not configured.');
  const bundle = entry.kind === 'prize' && entry.protocol === 'reward-bundle/1';
  const name = entry.kind === 'stamp' ? 'VoyagerStamps' : bundle ? 'VoyagerRewards' : 'VoyagerPrizes';
  const target = contractAddress(await response.json(), name);
  if (!ADDRESS.test(target || '')) throw new Error(`${name} address is not configured.`);
  const provider = readOnly ? new ethers.JsonRpcProvider(BASE.rpcUrls[0], BASE.chainId) : await wallet.ensureChain(BASE);
  const signer = readOnly ? provider : await provider.getSigner();
  if (!readOnly && (await signer.getAddress()).toLowerCase() !== address?.toLowerCase()) throw new Error('Wallet changed; reconnect and retry.');
  const args = entry.voucher || entry;
  if (args.player?.toLowerCase() !== address?.toLowerCase()) throw new Error('This reward belongs to a different wallet.');
  const abi = entry.kind === 'stamp'
    ? ['function mintWithVoucher(bytes32 gameId,(address player,bytes32 recordId,uint16 level,uint8 difficulty,string metadataURI,uint256 deadline) voucher,bytes signature)', 'function usedRecordId(bytes32) view returns (bool)']
    : bundle
      ? ['function claim((bytes32 gameId,address player,address nftContract,uint256 tokenId,uint256 nftAmount,address paymentToken,uint256 tokenAmount,uint256 nativeAmount,bytes32 awardId,bytes32 claimId,bytes32 recordId,uint256 deadline) reward,bytes signature)', 'function claimedToken(address,address,uint256) view returns (bool)']
      : ['function claim(bytes32 gameId,(address player,address nftContract,uint256 tokenId,uint8 tier,bytes32 runId,uint256 deadline) voucher,bytes signature)', 'function claimedToken(address,uint256) view returns (bool)'];
  const contract = new ethers.Contract(target, abi, signer);
  const claimed = () => entry.kind === 'stamp' ? contract.usedRecordId(args.recordId)
    : bundle ? contract.claimedToken(address, args.nftContract, args.tokenId) : contract.claimedToken(address, args.tokenId);
  return { contract, args, claimed, bundle, provider };
}
export async function transferReward(entry, options = {}) {
  const { onStatus = () => {}, onSubmitted = () => {}, onConfirmed = () => {} } = options;
  const { contract, args, claimed, bundle } = await rewardContract(entry, options);
  if (await claimed()) {
    onConfirmed({ status: 'collected' });
    onStatus('This reward was already collected on Base.');
    return;
  }
  if (!Number.isFinite(Number(args.deadline)) || Number(args.deadline) * 1000 <= Date.now()) throw new Error('Reward voucher expired. It cannot be transferred as-is.');
  const signature = entry.signature || entry.sig;
  if (!signature) throw new Error('Reward voucher signature is missing.');
  const parameters = bundle ? [args, signature] : [options.ethers.id('decent-voyager'), args, signature];
  const method = entry.kind === 'stamp' ? 'mintWithVoucher' : 'claim';
  const estimate = await contract[method].estimateGas(...parameters);
  if (options.wallet.snapshot().address?.toLowerCase() !== options.address?.toLowerCase()) throw new Error('Wallet changed before transfer; reconnect and retry.');
  onStatus('Approve the Base transfer in your wallet.');
  const tx = await contract[method](...parameters, { gasLimit: estimate * 120n / 100n });
  onSubmitted({ status: 'submitted', txHash: tx.hash });
  onStatus('Transfer submitted. Waiting for Base confirmation...');
  let receipt;
  try { receipt = await tx.wait(); }
  catch (error) {
    if (error.code !== 'TRANSACTION_REPLACED' || error.cancelled || !error.receipt) throw error;
    receipt = error.receipt;
  }
  if (!receipt || Number(receipt.status) !== 1) throw new Error('Base transfer was not confirmed successfully.');
  if (!await claimed()) throw new Error('Base did not confirm the reward collection.');
  onConfirmed({ status: 'collected', txHash: receipt.hash || tx.hash });
  onStatus('Collected! Base confirmed the transfer to your wallet.');
}
