const test=require('node:test');
const assert=require('node:assert/strict');
const {supporterDetails}=require('../src/js/supporter-catalog');
test('DCal purchase link uses reduced sale listing without changing Voyager prize identity',()=>{
  const token=supporterDetails(77),url=new URL(token.supportUrl);
  assert.equal(url.searchParams.get('listingId'),'20');
  assert.equal(url.searchParams.get('priceUSDC'),'10000000');
  assert.equal(token.tokenId,77);
  assert.equal(token.metadataURI,'ipfs://QmPqCy2g53t4BaffprtfjfM4L5imACB1nWZK63HyN9o3Tj');
});
