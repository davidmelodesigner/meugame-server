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
// BROADCAST
// ---------------------------
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

// ---------------------------
// CLEANUP (HEARTBEAT SYSTEM)
// ---------------------------
setInterval(() => {
    const now = Date.now();

    for (const id in players) {
        if (!players[id].lastSeen) continue;

        if (now - players[id].lastSeen > 5000) {
            console.log("Removendo player inativo:", id);
            delete players[id];
        }
    }

    broadcast();
}, 2000);

// ---------------------------
// CONNECTION
// ---------------------------
wss.on("connection", (ws) => {

    const id = Math.random().toString(36).substr(2, 9);

    console.log("Jogador conectado:", id);

    players[id] = {
        x: 0, y: 0, z: 0,
        rx: 0, ry: 0, rz: 0,
        lastSeen: Date.now()
    };

    // envia init
    ws.send(JSON.stringify({
        type: "init",
        id: id,
        data: players
    }));

    broadcast();

    // ---------------------------
    // MESSAGE
    // ---------------------------
    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            if (data.type === "update") {

                players[id] = {
                    ...data.data,
                    lastSeen: Date.now()
                };

                broadcast();
            }

        } catch (e) {}
    });

    // ---------------------------
    // CLOSE (backup only)
    // ---------------------------
    ws.on("close", () => {
        console.log("Player desconectado:", id);
        delete players[id];
        broadcast();
    });
});

// ---------------------------
// START SERVER
// ---------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
