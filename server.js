const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.get("/", (req, res) => {
    res.send("SERVER ONLINE");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

/* 💥 BROADCAST */
function broadcast(data, exclude) {
    const msg = JSON.stringify(data);

    wss.clients.forEach(client => {
        if (client !== exclude && client.readyState === 1) {
            client.send(msg);
        }
    });
}

wss.on("connection", (ws) => {

    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("message", (msg) => {

        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch {
            return;
        }

        /* 💥 JOIN */
        if (data.message === "join") {

            ws.id = data.id;

            players[ws.id] = {
                id: ws.id,
                x: 0,
                y: 0,
                z: 0
            };

            ws.send(JSON.stringify({
                message: "snapshot",
                players: Object.values(players)
            }));

            broadcast({
                message: "join",
                id: ws.id
            }, ws);
        }

        /* 💥 UPDATE PLAYER */
        if (data.message === "update") {

            if (!ws.id) return;

            players[ws.id] = {
                id: ws.id,
                x: data.x,
                y: data.y,
                z: data.z
            };

            broadcast({
                message: "update",
                id: ws.id,
                x: data.x,
                y: data.y,
                z: data.z
            }, ws);
        }

        /* 💥 LEAVE */
        if (data.message === "leave") {

            if (!ws.id) return;

            delete players[ws.id];

            broadcast({
                message: "leave",
                id: ws.id
            }, ws);
        }
    });

    ws.on("close", () => {

        if (ws.id) {
            delete players[ws.id];

            broadcast({
                message: "leave",
                id: ws.id
            }, ws);
        }
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

/* 💥 START */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("SERVER ONLINE PORT:", PORT);
});
