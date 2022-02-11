import assert from "assert";
// import axios from "axios";
import BigNumber from "bignumber.js";
import { Application, Request, Response } from "express";
import { IRouteOptions } from "./index";
import MCCNode from "../libs/MCCNode";

assert(process.env.INFURA_API_KEY, "No Infura API key for ETH mainnet");

const bscNodeContract = "BSC_NODES_CONTRACT";
const ethNodeContract = "ETH_NODES_CONTRACT";

export default async function NFT(
  app: Application,
  { bsc: bscWeb3, eth: ethWeb3, log }: IRouteOptions
) {
  app.get(
    "/metadata/:chain/contract.json",
    async function metadataContractRoute(req: Request, res: Response) {
      res.json({});
    }
  );

  app.get(
    "/metadata/:chain/:tokenId.json",
    async function metadataRoute(req: Request, res: Response) {
      try {
        const { chain, tokenId } = req.params;
        const web3 = chain.toLowerCase() === "bsc" ? bscWeb3 : ethWeb3;
        const chainName = chain.toLowerCase() === "bsc" ? "BSC" : "ETH";
        assert(web3, "web3 not available");
        const nodes =
          chain.toLowerCase() === "bsc" ? bscNodeContract : ethNodeContract;
        if (!nodes) throw new Error(`No NFT contract available`);
        const nodeContract = MCCNode(web3, nodes);

        try {
          const tokenOwner = await nodeContract.methods.ownerOf(tokenId).call();
          if (!tokenOwner) return res.status(404).send("NFT not found.");
        } catch (err) {
          log?.error(`error getting token owner`, chain, nodes, tokenId, err);
          return res.status(404).send("NFT not found.");
        }

        const [tier, usdPricePaid, mintedAt, tokenPerDayReturn] =
          await Promise.all([
            nodeContract.methods.tokenTier(tokenId).call(),
            nodeContract.methods.pricePaidUSD18(tokenId).call(),
            nodeContract.methods.tokenMintedAt(tokenId).call(),
            nodeContract.methods.tokenPerDayReturn(tokenId).call(),
          ]);

        res.json({
          name: `MCC Node (${chainName}) #${tokenId}`,
          description: `Passive income utility that is transferrable, tradeable, and flexible in nature.`,
          image: `ipfs://Qmdefu1DzQ4CDjabnxnhjBYBNWTd9onAgv8Kf4bX6SMrQf/${tier.id}.png`,
          edition: tokenId,
          date: new BigNumber(mintedAt).times(1000).toNumber(),
          attributes: [
            {
              trait_type: "TIER",
              value: tier.name,
            },
            {
              trait_type: "USD_PRICE_PAID",
              value: new BigNumber(usdPricePaid)
                .div(new BigNumber(10).pow(18))
                .toFormat(2),
            },
            {
              trait_type: "PER_DAY_RETURN_MCC",
              value: new BigNumber(tokenPerDayReturn)
                .div(new BigNumber(10).pow(9))
                .toFormat(9),
            },
          ],
        });
      } catch (err: any) {
        res.status(500).json({ error: err.stack });
      }
    }
  );
}
