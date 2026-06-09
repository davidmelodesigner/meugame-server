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

const app = express();


app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

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
            logout(ws, data);
            
        }
    });

    

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
