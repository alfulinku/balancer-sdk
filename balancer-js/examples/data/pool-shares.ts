import { Network } from '../../src/index';
import { BalancerSDK } from '../../src/modules/sdk.module';

const sdk = new BalancerSDK(
  { 
    network: Network.MAINNET, 
    rpcUrl: `${process.env.ALCHEMY_URL}` 
  });
const { data } = sdk;

(async function() {
  
  const POOLSHARE_ID = '0x01abc00e86c7e258823b9a055fd62ca6cf61a163-0x2da1bcb14be26be6812e0e871e8dc4f4c0d92629';
  const POOL_ID = '0x01abc00e86c7e258823b9a055fd62ca6cf61a16300010000000000000000003b'
  const USER_ADDR = '0xba12222222228d8ba445958a75a0704d566bf2c8';
  
  let result;
  
  result = await data.poolShares.findById(POOLSHARE_ID);
  console.log('Pool share by id', result);
  
  result = await data.poolShares.findByUser(USER_ADDR);
  console.log('Pool shares by user', result);
  
  result = await data.poolShares.findByPool(POOL_ID);
  console.log('Pool shares by pool', result);
  
  result = await data.poolShares.findByPool(POOL_ID, 5);
  console.log('Pool shares by pool (first 5)', result);
  
  result = await data.poolShares.findByPool(POOL_ID, 2, 1);
  console.log('Pool shares by pool (#2 & #3)', result);
})();

// npm run examples:exec -- ./examples/data/pool-shares.ts