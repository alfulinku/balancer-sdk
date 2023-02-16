// yarn test:only ./src/modules/pools/pool-types/concerns/composableStable/exit.concern.integration.spec.ts
import dotenv from 'dotenv';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { insert, Network, PoolWithMethods, removeItem } from '@/.';
import { subSlippage, addSlippage } from '@/lib/utils/slippageHelper';
import {
  forkSetup,
  TestPoolHelper,
  sendTransactionGetBalances,
} from '@/test/lib/utils';

dotenv.config();

describe('exit composable stable pool v1 execution', () => {
  const network = Network.MAINNET;
  const { ALCHEMY_URL: jsonRpcUrl } = process.env;
  const rpcUrl = 'http://127.0.0.1:8545';
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, network);
  const signer = provider.getSigner();
  const blockNumber = 16350000;
  const testPoolId =
    '0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d';
  let signerAddress: string;
  let pool: PoolWithMethods;
  // We have to rest the fork between each test as pool value changes after tx is submitted
  beforeEach(async () => {
    signerAddress = await signer.getAddress();

    const testPool = new TestPoolHelper(
      testPoolId,
      network,
      rpcUrl,
      blockNumber
    );

    // Gets initial pool info from Subgraph
    pool = await testPool.getPool();

    // Setup forked network, set initial token balances and allowances
    await forkSetup(
      signer,
      pool.tokensList,
      Array(pool.tokensList.length).fill(0),
      Array(pool.tokensList.length).fill(parseFixed('100000', 18).toString()),
      jsonRpcUrl as string,
      blockNumber // holds the same state as the static repository
    );

    // Updatate pool info with onchain state from fork block no
    pool = await testPool.getPool();
  });

  context('exitExactBPTIn', async () => {
    it('single token max out', async () => {
      const bptIn = parseFixed('10', 18).toString();
      const slippage = '10';
      const { to, data, minAmountsOut, expectedAmountsOut } =
        pool.buildExitExactBPTIn(
          signerAddress,
          bptIn,
          slippage,
          false,
          pool.tokensList[1]
        );
      const { transactionReceipt, balanceDeltas } =
        await sendTransactionGetBalances(
          pool.tokensList,
          signer,
          signerAddress,
          to,
          data
        );
      expect(transactionReceipt.status).to.eq(1);
      const expectedDeltas = insert(expectedAmountsOut, pool.bptIndex, bptIn);
      expect(expectedDeltas).to.deep.eq(balanceDeltas.map((a) => a.toString()));
      const expectedMins = expectedAmountsOut.map((a) =>
        subSlippage(BigNumber.from(a), BigNumber.from(slippage)).toString()
      );
      expect(expectedMins).to.deep.eq(minAmountsOut);
    });
  });

  context('exitExactTokensOut', async () => {
    it('all tokens with value', async () => {
      const tokensOut = removeItem(pool.tokensList, pool.bptIndex);
      const amountsOut = tokensOut.map((_, i) =>
        parseFixed((i * 100).toString(), 18).toString()
      );
      const slippage = '7';
      const { to, data, maxBPTIn, expectedBPTIn } =
        pool.buildExitExactTokensOut(
          signerAddress,
          tokensOut,
          amountsOut,
          slippage
        );
      const { transactionReceipt, balanceDeltas } =
        await sendTransactionGetBalances(
          pool.tokensList,
          signer,
          signerAddress,
          to,
          data
        );
      expect(transactionReceipt.status).to.eq(1);
      const expectedDeltas = insert(amountsOut, pool.bptIndex, expectedBPTIn);
      expect(expectedDeltas).to.deep.eq(balanceDeltas.map((a) => a.toString()));
      const expectedMaxBpt = addSlippage(
        BigNumber.from(expectedBPTIn),
        BigNumber.from(slippage)
      ).toString();
      expect(expectedMaxBpt).to.deep.eq(maxBPTIn);
    });
    it('single token with value', async () => {
      const tokensOut = removeItem(pool.tokensList, pool.bptIndex);
      const amountsOut = Array(tokensOut.length).fill('0');
      amountsOut[0] = parseFixed('202', 18).toString();
      const slippage = '7';
      const { to, data, maxBPTIn, expectedBPTIn } =
        pool.buildExitExactTokensOut(
          signerAddress,
          tokensOut,
          amountsOut,
          slippage
        );
      const { transactionReceipt, balanceDeltas } =
        await sendTransactionGetBalances(
          pool.tokensList,
          signer,
          signerAddress,
          to,
          data
        );
      expect(transactionReceipt.status).to.eq(1);
      const expectedDeltas = insert(amountsOut, pool.bptIndex, expectedBPTIn);
      expect(expectedDeltas).to.deep.eq(balanceDeltas.map((a) => a.toString()));
      const expectedMaxBpt = addSlippage(
        BigNumber.from(expectedBPTIn),
        BigNumber.from(slippage)
      ).toString();
      expect(expectedMaxBpt).to.deep.eq(maxBPTIn);
    });
  });
});

describe('exit composable stable pool v2 execution', () => {
  const network = Network.POLYGON;
  const { ALCHEMY_URL_POLYGON: jsonRpcUrl } = process.env;
  const rpcUrl = 'http://127.0.0.1:8137';
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, network);
  const signer = provider.getSigner();
  const blockNumber = 39033320;
  const testPoolId =
    '0x373b347bc87998b151a5e9b6bb6ca692b766648a000000000000000000000923';
  let signerAddress: string;
  let pool: PoolWithMethods;
  // We have to rest the fork between each test as pool value changes after tx is submitted
  beforeEach(async () => {
    try {
      signerAddress = await signer.getAddress();

      const testPool = new TestPoolHelper(
        testPoolId,
        network,
        rpcUrl,
        blockNumber
      );

      // Gets initial pool info from Subgraph
      pool = await testPool.getPool();

      // Setup forked network, set initial token balances and allowances
      await forkSetup(
        signer,
        pool.tokensList,
        Array(pool.tokensList.length).fill(0),
        Array(pool.tokensList.length).fill(parseFixed('100000', 18).toString()),
        jsonRpcUrl as string,
        blockNumber // holds the same state as the static repository
      );

      // Updatate pool info with onchain state from fork block no
      pool = await testPool.getPool();
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

  context('exitExactBPTIn', async () => {
    it('proportional exit', async () => {
      const bptIn = parseFixed('0.01', 18).toString();
      const slippage = '10';
      const { to, data, minAmountsOut, expectedAmountsOut } =
        pool.buildExitExactBPTIn(signerAddress, bptIn, slippage, false);
      const { transactionReceipt, balanceDeltas } =
        await sendTransactionGetBalances(
          pool.tokensList,
          signer,
          signerAddress,
          to,
          data
        );
      expect(transactionReceipt.status).to.eq(1);
      const expectedDeltas = insert(expectedAmountsOut, pool.bptIndex, bptIn);
      expect(expectedDeltas).to.deep.eq(balanceDeltas.map((a) => a.toString()));
      const expectedMins = expectedAmountsOut.map((a) =>
        subSlippage(BigNumber.from(a), BigNumber.from(slippage)).toString()
      );
      expect(expectedMins).to.deep.eq(minAmountsOut);
    });
  });
});
