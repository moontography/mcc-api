import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import Web3 from "web3";
import log from "./logger";
import redis from "./redis";
import config from "./config";
import Routes from "./routes";

const app = express();
const server = new http.Server(app);

export default async function startServer(portToListenOn = config.server.port) {
  return await new Promise((resolve, reject) => {
    try {
      app.disable("x-powered-by");

      // https://expressjs.com/en/guide/behind-proxies.html
      app.set("trust proxy", 1);
      app.use(cors());

      const bsc = new Web3(
        new Web3.providers.HttpProvider(`https://bsc-dataseed.binance.org`)
      );
      const eth = new Web3(
        new Web3.providers.HttpProvider(
          `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      );

      Routes(app, { bsc, eth, log, redis });

      app.all("*", function fallbackRoute(req: Request, res: Response) {
        res.sendStatus(404);
      });

      app.use(function expressErrorHandler(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
      ) {
        log.error("Express error handling", err);
        res.sendStatus(500);
      });

      server.listen(portToListenOn, () => {
        log.info(`listening on *:${portToListenOn}`);
        resolve(app);
      });
    } catch (err) {
      log.error("Error starting server", err);
      reject(err);
    }
  });
}
