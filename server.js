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

wss.on("connection", (ws) => {

    ws.userId = generateId();

    players[ws.userId] = {
        id: ws.userId,
        x: 0,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0
    };

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.message === "startserver") {
            ws.send(JSON.stringify({
                message: "connected",
                id: ws.userId
            }));
        }
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
        // 💥 UPDATE: só salva no servidor
        if (data.message === "updateplayer") {

            players[data.userId] = {
                id: data.userId,
                x: data.x,
                y: data.y,
                z: data.z,
                rx: data.rx,
                ry: data.ry,
                rz: data.rz
            };
        }
    });

    ws.on("close", () => {
        delete players[ws.userId];
    });
});


// 💥 SNAPSHOT GLOBAL (envia todos os players)
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


server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
