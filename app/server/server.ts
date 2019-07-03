import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { Game } from "./Game";
import SocketServer from "./socket";
// import { Game as G } from "../client/game";

// const gg = new G();

const port = 3000;
const staticPath = "../public";

const extToContent: { [ex: string]: string } = {
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpg",
  html: "text/html"
};

const server = http.createServer((req, res) => {
  let filePath = staticPath + req.url;
  if (filePath === `${staticPath}/`) {
    filePath += "index.html";
  }

  filePath = path.join(__dirname, filePath);

  const extname = path.extname(filePath).substr(1);
  const contentType =
    extname in extToContent ? extToContent[extname] : "text/html";

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if (error.code == "ENOENT") {
        res.end("404 Not Found");
      } else {
        res.writeHead(500);
        res.end(`ERROR:${JSON.stringify(error)}`);
      }
    } else {
      res.writeHead(200, {
        "Content-Type": contentType
      });
      res.end(content, "utf-8");
    }
  });
});

server.listen(port, () => console.log(`Server running on port:${port}`));

const wss = new SocketServer(server);

const game = new Game(wss);