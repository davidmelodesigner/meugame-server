const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const logout = require("./logout");
const loginserver = require("./loginserver");
const userlogued = require("./userslogued");
const inicServer = require("./inicServer");
const homepage = require("./home");
const playerupdate = require("./playerupdate");

const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/* 💥 ESTADO DO MUNDO */
const players = {};

wss.on("connection", (ws) => {

    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.message == "startserver") {
            inicServer(ws, data);
        }

        if (data.message == "getusers") {
            userlogued(ws, data);
        }

        if (data.message === "login") {
            loginserver(ws, data);
        }

        /* 💥 LOGIN / ID */
        if (data.message === "senduserid") {

            ws.userId = data.userid;

            /* 🔥 AQUI ESTAVA FALTANDO O SNAPSHOT */
            ws.send(JSON.stringify({
                message: "snapshot_players",
                players: Object.values(players)
            }));

            userlogued(ws, data);
        }

        if (data.message === "quitserver") {
            logout(ws, data, wss);

            delete players[ws.userId];
        }

        /* 💥 PLAYER UPDATE */
        if (data.message === "playerupdate") {

            /* GARANTE QUE SEMPRE EXISTE NO MUNDO */
            players[data.userid] = data;

            playerupdate(ws, data, wss);
        }
    });

    ws.on("close", () => {
        ws.isAlive = false;

        if (ws.userId) {
            delete players[ws.userId];

            wss.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(JSON.stringify({
                        message: "userdisconnect",
                        userid: ws.userId
                    }));
                }
            });
        }
    });
});

/* 💥 HEARTBEAT */
setInterval(() => {

    wss.clients.forEach(ws => {

        if (ws.isAlive === false) {

            if (ws.userId) {
                delete players[ws.userId];

                wss.clients.forEach(client => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({
                            message: "userdisconnect",
                            userid: ws.userId
                        }));
                    }
                });
            }

            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();

    });

}, 5000);

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
