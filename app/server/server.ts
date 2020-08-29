import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import express from "express";
import bodyParser from "body-parser";
import { ServerGame } from "./serverGame";
import SocketServer from "./socket";

const port = 3000;
const staticPath = "../../public";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json({
  limit: "50mb"
}));

app.post("/world", (req, res) => {
  console.log("Saving the world");
  const data = JSON.stringify(req.body);
  fs.writeFileSync("/home/tyler/p/falling-blocks/worlds/world.json", data);
});

app.get("/world", (req, res) => {
  const data = fs.readFileSync("/home/tyler/p/falling-blocks/worlds/world.json");
  res.send(data);
});


app.use(express.static(path.join(__dirname, staticPath)));

const server = app.listen(port, () => console.log(`Server running on port:${port}`));

const wss = new SocketServer(server);

const game = new ServerGame(wss);
