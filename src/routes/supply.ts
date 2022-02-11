import assert from "assert";
import BigNumber from "bignumber.js";
import { Application, Request, Response } from "express";
import { IRouteOptions } from "./index";
import ERC20 from "../libs/ERC20";

assert(process.env.INFURA_API_KEY, "No Infura API key for ETH mainnet");

const walletInfo: any = {
  bsc: {
    bridge: "0xFB1cafce4F54a5Ee5Ddd3c6B67c941086F7d9926",
    token: "0xc146b7cdbaff065090077151d391f4c96aa09e0c",
    treasuries: [
      "0xFBf335f8224a102e22abE78D78CC52dc95e074Fa",
      "0x43853A1999f1dC727f407e22283b16BC0FE7B49b",
      "0x8d73879ac62d653e31f71ce3fb522acddfb52a09",
      "0x1d7d860f3850eB192d51DD6aA35a435c0bC4B05C",
    ],
  },
  eth: {
    bridge: "0x9c59e2fe66a8999c947b5d240f574704e3f31945",
    token: "0xc146b7cdbaff065090077151d391f4c96aa09e0c",
    treasuries: [
      "0xFBf335f8224a102e22abE78D78CC52dc95e074Fa",
      "0x43853A1999f1dC727f407e22283b16BC0FE7B49b",
      "0x8d73879ac62d653e31f71ce3fb522acddfb52a09",
      "0x1d7d860f3850eB192d51DD6aA35a435c0bC4B05C",
    ],
  },
};
const burnWallet = "0x000000000000000000000000000000000000dEaD";

export default async function Supply(
  app: Application,
  { bsc: bscWeb3, eth: ethWeb3 }: IRouteOptions
) {
  assert(bscWeb3, "web3 instance not provided");
  assert(ethWeb3, "web3 instance not provided");
  app.get("/total", async function totalRoute(_: Request, res: Response) {
    try {
      const bscContract = ERC20(bscWeb3, walletInfo.bsc.token);
      const ethContract = ERC20(ethWeb3, walletInfo.eth.token);
      const [
        bscTotalSupply,
        ethTotalSupply,
        bscDecimals,
        bscBurnedAddyBal,
        // ethTotalSupply,
        ethDecimals,
        ethBurnedAddyBal,
      ] = await Promise.all([
        bscContract.methods.totalSupply().call(),
        ethContract.methods.totalSupply().call(),
        bscContract.methods.decimals().call(),
        bscContract.methods.balanceOf(burnWallet).call(),
        // ethContract.methods.totalSupply().call(),
        ethContract.methods.decimals().call(),
        ethContract.methods.balanceOf(burnWallet).call(),
      ]);
      res.send(
        getBalance(bscTotalSupply, bscDecimals)
          .plus(getBalance(ethTotalSupply, bscDecimals))
          .minus(getBalance(bscBurnedAddyBal, bscDecimals))
          .minus(getBalance(ethBurnedAddyBal, ethDecimals))
          .toString()
      );
    } catch (err: any) {
      res.status(500).json({ error: err.stack });
    }
  });

  app.get(
    "/circulating",
    async function circulatingRoute(_: Request, res: Response) {
      try {
        const bscContract = ERC20(bscWeb3, walletInfo.bsc.token);
        const ethContract = ERC20(ethWeb3, walletInfo.eth.token);
        const [bscDecimals, ethDecimals] = await Promise.all([
          bscContract.methods.decimals().call(),
          ethContract.methods.decimals().call(),
        ]);
        const [
          bscTotalSupply,
          ethTotalSupply,
          bscBurnedAddyBal,
          ethBurnedAddyBal,
          bscTreasuryWalletBal,
          ethTreasuryWalletBal,
          bscBridgeWalletBal,
          ethBridgeWalletBal,
        ] = await Promise.all([
          bscContract.methods.totalSupply().call(),
          ethContract.methods.totalSupply().call(),
          bscContract.methods.balanceOf(burnWallet).call(),
          ethContract.methods.balanceOf(burnWallet).call(),
          getAndSumMultipleBalances(bscContract, walletInfo.bsc.treasuries),
          getAndSumMultipleBalances(ethContract, walletInfo.eth.treasuries),
          bscContract.methods.balanceOf(walletInfo.bsc.bridge).call(),
          ethContract.methods.balanceOf(walletInfo.eth.bridge).call(),
        ]);
        res.send(
          getBalance(bscTotalSupply, bscDecimals)
            .plus(getBalance(ethTotalSupply, ethDecimals))
            .minus(getBalance(bscBurnedAddyBal, bscDecimals))
            .minus(getBalance(ethBurnedAddyBal, ethDecimals))
            .minus(getBalance(bscTreasuryWalletBal, bscDecimals))
            .minus(getBalance(ethTreasuryWalletBal, ethDecimals))
            .minus(getBalance(bscBridgeWalletBal, bscDecimals))
            .minus(getBalance(ethBridgeWalletBal, ethDecimals))
            .toString()
        );
      } catch (err: any) {
        res.status(500).json({ error: err.stack });
      }
    }
  );

  app.get("/burned", async function burnedRoute(_: Request, res: Response) {
    try {
      // const bscContract = ERC20(bscWeb3, walletInfo.bsc.token);
      const ethContract = ERC20(ethWeb3, walletInfo.eth.token);
      const [/* bscDecimals, */ ethDecimals] = await Promise.all([
        // bscContract.methods.decimals().call(),
        ethContract.methods.decimals().call(),
      ]);
      const [
        // bscBurnedAddyBal,
        ethBurnedAddyBal,
      ] = await Promise.all([
        // bscContract.methods.balanceOf(burnWallet).call(),
        ethContract.methods.balanceOf(burnWallet).call(),
      ]);
      res.send(
        getBalance(ethBurnedAddyBal, ethDecimals)
          // .plus(getBalance(bscBurnedAddyBal, bscDecimals))
          .toString()
      );
    } catch (err: any) {
      res.status(500).json({ error: err.stack });
    }
  });
}

function getBalance(bal: number | string, decimals: number | string) {
  return new BigNumber(bal).div(new BigNumber(10).pow(decimals));
}

async function getAndSumMultipleBalances(contract: any, wallets: string[]) {
  const bals: any[] = await Promise.all(
    wallets.map(
      async (wallet) => await contract.methods.balanceOf(wallet).call()
    )
  );
  return bals.reduce((sum, bal) => new BigNumber(sum).plus(bal), 0);
}
