const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");
const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

wss.on("connection", (ws) => {

    ws.userId = null;

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());
        if(data.message=="startserver"){
            ws.send(JSON.stringify({
                    message: "connected",
                    data: data
            }));

        }
       
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
