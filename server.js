const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.get("/", (req, res) => {
    res.send("OK");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {

    console.log("cliente conectado");

    // 👇 evento de teste enviado automaticamente
    ws.send(JSON.stringify({
        type: "test",
        message: "server funcionando"
    }));

});

server.listen(3000);
