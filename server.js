const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* 💥 WORLD STATE */
const players = new Map();

/* 💥 ROUTER DE MENSAGENS */
function handleMessage(ws, data) {

    switch (data.message) {

        case "join":
            handleJoin(ws, data);
            break;

        case "update":
            handleUpdate(ws, data);
            break;

        case "leave":
            handleLeave(ws);
            break;

    }
}

/* 💥 JOIN PLAYER */
function handleJoin(ws, data) {

    ws.id = data.id;

    players.set(ws.id, {
        id: ws.id,
        x: 0,
        y: 0,
        z: 0
    });

    ws.send(JSON.stringify({
        message: "snapshot",
        players: Array.from(players.values())
    }));

    broadcast({
        message: "join",
        id: ws.id
    }, ws);
}

/* 💥 UPDATE PLAYER */
function handleUpdate(ws, data) {

    if (!ws.id) return;

    const p = players.get(ws.id);

    if (!p) return;

    p.x = data.x;
    p.y = data.y;
    p.z = data.z;

    broadcast({
        message: "update",
        id: ws.id,
        x: p.x,
        y: p.y,
        z: p.z
    }, ws);
}

/* 💥 REMOVE PLAYER */
function handleLeave(ws) {

    if (!ws.id) return;

    players.delete(ws.id);

    broadcast({
        message: "leave",
        id: ws.id
    }, ws);
}

/* 💥 BROADCAST */
function broadcast(data, exclude) {

    const msg = JSON.stringify(data);

    wss.clients.forEach(client => {
        if (client !== exclude && client.readyState === 1) {
            client.send(msg);
        }
    });
}

/* 💥 WS CONNECTION */
wss.on("connection", (ws) => {

    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("message", (msg) => {

        try {
            const data = JSON.parse(msg.toString());
            handleMessage(ws, data);
        } catch (e) {}
    });

    ws.on("close", () => {
        handleLeave(ws);
    });
});

/* 💥 HEARTBEAT */
setInterval(() => {

    wss.clients.forEach(ws => {

        if (!ws.isAlive) {
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });

}, 5000);

/* 💥 EXPRESS */
app.get("/", (req, res) => {
    res.send("SERVER ONLINE");
});

/* 💥 START */
server.listen(3000, () => {
    console.log("SERVER ON PORT 3000");
});
