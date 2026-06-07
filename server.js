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
// HEARTBEAT CLEANUP
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

        walk: false,
        run: false,
        attack: false,
        special: false,

        lastSeen: Date.now()
    };

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

                const p = data.data;

                players[id] = {
                    x: p.x ?? players[id].x,
                    y: p.y ?? players[id].y,
                    z: p.z ?? players[id].z,

                    rx: p.rx ?? players[id].rx,
                    ry: p.ry ?? players[id].ry,
                    rz: p.rz ?? players[id].rz,

                    walk: p.walk ?? false,
                    run: p.run ?? false,
                    attack: p.attack ?? false,
                    special: p.special ?? false,

                    lastSeen: Date.now()
                };

                broadcast();
            }

        } catch (e) {}
    });

    // ---------------------------
    // CLOSE
    // ---------------------------
    ws.on("close", () => {
        console.log("Player desconectado:", id);
        delete players[id];
        broadcast();
    });
});

// ---------------------------
// START
// ---------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
