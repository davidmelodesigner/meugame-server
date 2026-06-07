const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.get("/", (req, res) => {
    res.send("Servidor online OK");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = {};

function broadcast() {
    const data = JSON.stringify({
        type: "players",
        data: players
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on("connection", (ws) => {

    const id = Math.random().toString(36).substr(2, 9);

    console.log("Jogador conectado:", id);

    players[id] = {
        x: 0, y: 0, z: 0,
        rx: 0, ry: 0, rz: 0
    };

    ws.send(JSON.stringify({
        type: "init",
        id: id,
        data: players
    }));

    broadcast();

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            if (data.type === "update") {
                players[id] = data.data;
                broadcast();
            }

        } catch (e) {}
    });

    ws.on("close", () => {
        delete players[id];
        broadcast();
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
