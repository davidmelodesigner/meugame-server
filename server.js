const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const inicServer = require("./inicServer");
const loginserver = require("./loginserver");
const logout = require("./logout");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {

        const data = JSON.parse(msg.toString());

        switch (data.message) {

            case "startserver":
                inicServer(ws, data);
                break;

            case "login":
                loginserver(ws, data);
                break;

            case "quitserver":
                logout(ws, data);
                break;
        }

    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
