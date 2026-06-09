const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const logout = require("./logout");
const loginserver = require("./loginserver");
const callconfigs = require("./config");
const userlogued = require("./userslogued");

const app = express();

app.get("/", (req, res) => {
    res.send("Servidor online OK");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    console.log("cliente conectado");

    ws.on("message", (msg) => {
        const data = JSON.parse(msg.toString());

        if (data.message == "startserver") {
            userlogued(ws, data);
        }

        if (data.message === "login") {
            loginserver(ws, data);
        }

        if (data.message === "quitserver") {
            logout(ws, data);
        }
    });

    ws.on("close", () => {
        console.log("cliente saiu");
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
