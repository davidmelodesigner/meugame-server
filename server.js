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

// -------------------------
// CONNECTION
// -------------------------
wss.on("connection", (ws) => {

    ws.userId = generateId();

    players[ws.userId] = {
        id: ws.userId,
        x: 0, y: 0, z: 0,
        rx: 0, ry: 0, rz: 0,
        lastSeen: Date.now()
    };

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        // -------------------------
        // START
        // -------------------------
        if (data.message === "startserver") {

            ws.send(JSON.stringify({
                message: "connected",
                id: ws.userId
            }));
        }

        // -------------------------
        // UPDATE PLAYER
        // -------------------------
        if (data.message === "updateplayer") {

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
        // MANUAL DISCONNECT
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

            if (players[ws.userId]) {
                players[ws.userId].lastSeen = Date.now();
            }
        }
    });

    ws.on("close", () => {

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
    const timeout = 5000; // 5s sem ping = morto

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
