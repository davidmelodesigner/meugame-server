const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const homepage = require("./home.js");
const homepage = require("./login.js");



const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});
app.post("/login", loginusers);
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

// ---------------- CONNECTION ----------------
wss.on("connection", (ws) => {

    ws.userId = Math.random().toString(36).substr(2, 9);

    players[ws.userId] = {
        id: ws.userId,
        x: 200,
        y: 200,
        anim: null,
        lastSeen: Date.now()
    };

    ws.send(JSON.stringify({
        message: "connected",
        id: ws.userId
    }));

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        // ---------------- UPDATE PLAYER ----------------
        if (data.message === "updateplayer") {

            if (!players[data.id]) return;

            // 🔥 atualiza SOMENTE o necessário (não espalha lixo)
            players[data.id].x = data.x;
            players[data.id].y = data.y;
            players[data.id].anim = data.anim;
            players[data.id].lastSeen = Date.now();
        }

        // ---------------- PING ----------------
        if (data.message === "ping") {
            if (players[ws.userId]) {
                players[ws.userId].lastSeen = Date.now();
            }
        }

        // ---------------- DISCONNECT ----------------
        if (data.message === "disconnect") {

            delete players[ws.userId];

            broadcastRemove(ws.userId);
        }
    });

    ws.on("close", () => {
        delete players[ws.userId];
        broadcastRemove(ws.userId);
    });
});

// ---------------- SNAPSHOT BROADCAST ----------------
function broadcast() {

    const snapshot = JSON.stringify({
        message: "snapshot",
        players: Object.values(players)
    });

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(snapshot);
        }
    });
}

function broadcastRemove(id) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify({
                message: "remove",
                userId: id
            }));
        }
    });
}

// ---------------- LOOP ----------------
setInterval(() => {
    broadcast();
}, 50);

// ---------------- CLEANER ----------------
setInterval(() => {

    const now = Date.now();
    const timeout = 5000;

    for (const id in players) {
        if (now - players[id].lastSeen > timeout) {
            delete players[id];
            broadcastRemove(id);
        }
    }

}, 2000);

// ---------------- START ----------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
