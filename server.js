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

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

wss.on("connection", (ws) => {

    ws.userId = generateId();

    // 🔥 AGORA SIM: salva no players
    players[ws.userId] = {
        id: ws.userId
    };

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.message === "startserver") {

            ws.send(JSON.stringify({
                message: "connected",
                id: ws.userId
            }));
        }
        if (data.message === "updateplayer") {

            ws.send(JSON.stringify({
                message: "updateplayer",
                data: data
            }));
        }
    });

    ws.on("close", () => {
        delete players[ws.userId];
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
