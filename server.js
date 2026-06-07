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

// ---------------------------
// BROADCAST (STREAM FIXO)
// ---------------------------
setInterval(() => {
    const data = JSON.stringify({
        type: "players",
        data: players
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });

}, 66); // ~15x por segundo (mais estável que 20x)

// ---------------------------
// CLEANUP (ANTI-FANTASMA)
// ---------------------------
setInterval(() => {
    const now = Date.now();

    for (const id in players) {
        if (now - players[id].lastSeen > 5000) {
            console.log("Removendo player inativo:", id);
            delete players[id];
        }
    }

}, 1000);

// ---------------------------
// CONNECTION
// ---------------------------
wss.on("connection", (ws) => {

    const id = Math.random().toString(36).substr(2, 9);

    console.log("Jogador conectado:", id);

    players[id] = {
        x: 0,
        y: 0,
        z: 0,

        rx: 0,
        ry: 0,
        rz: 0,

        lastSeen: Date.now()
    };

    // ---------------------------
    // SNAPSHOT INICIAL
    // ---------------------------
    ws.send(JSON.stringify({
        type: "snapshot",
        id: id,
        data: players
    }));

    // ---------------------------
    // MESSAGE
    // ---------------------------
    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            if (data.type === "update") {

                const p = data.data;

                if (!players[id]) return;

                players[id].x = p.x ?? players[id].x;
                players[id].y = p.y ?? players[id].y;
                players[id].z = p.z ?? players[id].z;

                players[id].rx = p.rx ?? players[id].rx;
                players[id].ry = p.ry ?? players[id].ry;
                players[id].rz = p.rz ?? players[id].rz;

                players[id].lastSeen = Date.now();
            }

        } catch (e) {}
    });

    // ---------------------------
    // CLOSE
    // ---------------------------
    ws.on("close", () => {
        console.log("Player desconectado:", id);
        delete players[id];
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
