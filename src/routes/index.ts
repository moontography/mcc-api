import bunyan from "bunyan";
import { Application } from "express";
import { Redis } from "ioredis";
import Web3 from "web3";
import main from "./main";
import nft from "./nft";
import supply from "./supply";

export interface IRouteOptions {
  bsc?: Web3;
  eth?: Web3;
  log?: bunyan;
  redis?: Redis;
}

export default async function Routes(
  app: Application,
  { bsc, eth, log, redis }: IRouteOptions
) {
  main(app);
  nft(app, { bsc, eth, log });
  supply(app, { bsc, eth });
}
