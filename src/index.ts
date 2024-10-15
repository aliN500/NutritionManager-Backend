import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import Communicator from "@utils/communicator";
const app: Express = express();
const port = process.env.PORT || 7000;

app.get("/", async (req: Request, res: Response) => {
    await Communicator.getUsers();
    res.send("Express + TypeScript Server test");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
