import { Application, Request, Response } from "express";

export default async function Main(app: Application) {
  app.get("/status", async function status(_: Request, res: Response) {
    res.sendStatus(204);
  });
}
