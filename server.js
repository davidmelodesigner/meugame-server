const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.get("/", (req, res) => {
    res.send("SERVER ONLINE");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

wss.on("connection", (ws) => {

    ws.userId = null;

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        // ENTRAR NO JOGO
        if (data.message === "join") {

            ws.userId = data.id;

            players[ws.userId] = {
                id: ws.userId,
                x: 0,
                y: 0,
                z: 0
            };

            // snapshot (igual teu sistema antigo)
            ws.send(JSON.stringify({
                message: "snapshot",
                players: Object.values(players)
            }));

            return;
        }

        // UPDATE PLAYER
        if (data.message === "update") {

            if (!ws.userId) return;

            players[ws.userId] = {
                id: ws.userId,
                x: data.x,
                y: data.y,
                z: data.z
            };

            // broadcast simples
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        message: "update",
                        id: ws.userId,
                        x: data.x,
                        y: data.y,
                        z: data.z
                    }));
                }
            });
        }
    });

    ws.on("close", () => {

        if (ws.userId) {

            delete players[ws.userId];

            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        message: "remove",
                        id: ws.userId
                    }));
                }
            });
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
