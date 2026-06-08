const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.get("/", (req, res) => {
    res.send("Servidor online OK");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    console.log("cliente conectado");

    ws.send(JSON.stringify({
        type: "test",
        message: "ok conectado"
    }));

    ws.on("message", (msg) => {
        console.log("msg:", msg.toString());
    });

    ws.on("close", () => {
        console.log("cliente saiu");
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
