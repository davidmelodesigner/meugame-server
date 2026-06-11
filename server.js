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

// -------------------------
// CONNECTION
// -------------------------
wss.on("connection", (ws) => {

    ws.userId = null;

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        // -------------------------
        // START / LOGIN
        // -------------------------
        if (data.message === "startserver") {

            // 👇 ID vem do CLIENTE (OBRIGATÓRIO)
            ws.userId = data.userId;

            // cria player só se não existir
            if (!players[ws.userId]) {
                players[ws.userId] = {
                    id: ws.userId,
                    x: 0, y: 0, z: 0,
                    rx: 0, ry: 0, rz: 0,
                    lastSeen: Date.now()
                };
            }

            ws.send(JSON.stringify({
                message: "connected",
                id: ws.userId
            }));

            return;
        }

        // -------------------------
        // UPDATE PLAYER
        // -------------------------
        if (data.message === "updateplayer") {

            if (!data.userId || !players[data.userId]) return;

            players[data.userId] = {
                ...players[data.userId],
                id: data.userId,
                x: data.x,
                y: data.y,
                z: data.z,
                rx: data.rx,
                ry: data.ry,
                rz: data.rz,
                lastSeen: Date.now()
            };
        }

        // -------------------------
        // DISCONNECT MANUAL
        // -------------------------
        if (data.message === "disconnect") {

            const id = data.userId;

            delete players[id];

            wss.clients.forEach(client => {

                if (client.readyState !== 1) return;

                client.send(JSON.stringify({
                    message: "remove",
                    userId: id
                }));
            });
        }

        // -------------------------
        // PING
        // -------------------------
        if (data.message === "ping") {

            if (ws.userId && players[ws.userId]) {
                players[ws.userId].lastSeen = Date.now();
            }
        }
    });

    // -------------------------
    // CLOSE SOCKET
    // -------------------------
    ws.on("close", () => {

        if (!ws.userId) return;

        delete players[ws.userId];

        wss.clients.forEach(client => {

            if (client.readyState !== 1) return;

            client.send(JSON.stringify({
                message: "remove",
                userId: ws.userId
            }));
        });
    });
});


// -------------------------
// SNAPSHOT SYSTEM
// -------------------------
setInterval(() => {

    const snapshot = {
        message: "snapshot",
        players: Object.values(players)
    };

    wss.clients.forEach(client => {

        if (client.readyState !== 1) return;

        client.send(JSON.stringify(snapshot));
    });

}, 50);


// -------------------------
// GHOST CLEANER (PING TIMEOUT)
// -------------------------
setInterval(() => {

    const now = Date.now();
    const timeout = 5000;

    for (const id in players) {

        if (now - players[id].lastSeen > timeout) {

            delete players[id];

            wss.clients.forEach(client => {

                if (client.readyState !== 1) return;

                client.send(JSON.stringify({
                    message: "remove",
                    userId: id
                }));
            });
        }
    }

}, 2000);


// -------------------------
// START SERVER
// -------------------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
