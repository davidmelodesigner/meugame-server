const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const logout = require("./logout");
const loginserver = require("./loginserver");
const callconfigs = require("./config");
const userlogued = require("./userslogued");
const inicServer = require("./inicServer");
const homepage = require("./home");
const connectserver = require("./connectserver");
const playerupdate = require("./playerupdate");

const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

        if (data.message === "senduserid") {
            userlogued(ws, data);
        }

        if (data.message === "quitserver") {
            logout(ws, data, wss);
        }

        if (data.message === "playerupdate") {
            playerupdate(ws, data, wss);
        }
    });

    ws.on("close", () => {
        ws.isAlive = false;
    });
});

setInterval(() => {

    wss.clients.forEach(ws => {

        if (ws.isAlive === false) {

            if (ws.userId) {
                console.log("TIMEOUT REMOVE:", ws.userId);

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
