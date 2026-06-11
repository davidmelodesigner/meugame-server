const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

app.get("/", (req, res) => {
    res.send("SERVER ONLINE");
});

wss.on("connection", (ws) => {

    console.log("PLAYER CONNECTED");

    ws.id = null;

    // quando recebe mensagem
    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        // JOIN PLAYER
        if (data.message === "join") {
            ws.id = data.id;

            // salva player
            players[ws.id] = {
                id: ws.id,
                x: 0,
                y: 0,
                z: 0
            };

            // manda snapshot
            ws.send(JSON.stringify({
                message: "snapshot",
                players: Object.values(players)
            }));

            return;
        }

        // UPDATE POSITION
        if (data.message === "update") {

            if (!ws.id) return;

            // atualiza mundo
            players[ws.id] = {
                id: ws.id,
                x: data.x,
                y: data.y,
                z: data.z
            };

            // broadcast pra todos
            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        message: "update",
                        id: ws.id,
                        x: data.x,
                        y: data.y,
                        z: data.z
                    }));
                }
            });
        }
    });

    // disconnect
    ws.on("close", () => {

        if (ws.id && players[ws.id]) {

            delete players[ws.id];

            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        message: "remove",
                        id: ws.id
                    }));
                }
            });
        }

        console.log("PLAYER DISCONNECTED");
    });
});

server.listen(3000, () => {
    console.log("SERVER ONLINE PORT 3000");
});
