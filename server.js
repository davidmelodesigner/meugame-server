const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

let players = {};

wss.on("connection", (ws) => {

    const id = Math.random().toString(36).substr(2, 9);

    console.log("Jogador conectado:", id);

    players[id] = { x: 0, y: 0, z: 0 };

    ws.send(JSON.stringify({
        type: "players",
        data: players
    }));

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            if (data.type === "update") {
                players[id] = data.data;

                // envia pra todos
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "players",
                            data: players
                        }));
                    }
                });
            }
        } catch (e) {}
    });

    ws.on("close", () => {
        delete players[id];

        // atualiza todos
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "players",
                    data: players
                }));
            }
        });
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
