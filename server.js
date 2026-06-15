const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const homepage = require("./home.js");
const loginusers = require("./login.js");

const app = express();

app.get("/", (req, res) => {
    homepage(req, res);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ---------------- CONNECTION ----------------
wss.on("connection", (ws) => {

    console.log("Cliente conectado.");

    ws.send(JSON.stringify({
        message: "connected"
    }));

    ws.on("message", async (msg) => {

        try {

            const data = JSON.parse(msg.toString());

            // ---------------- LOGIN ----------------
            if (data.message === "login") {

                const resultado = await loginusers(
                    data.usuario,
                    data.senha
                );

                ws.send(JSON.stringify({
                    message: "login",
                    success: resultado.success
                }));

                return;
            }

        } catch (err) {

            console.log(err);

            ws.send(JSON.stringify({
                message: "error",
                success: false
            }));

        }

    });

    ws.on("close", () => {
        console.log("Cliente desconectado.");
    });

});

// ---------------- START ----------------
server.listen(process.env.PORT || 3000, () => {
    console.log("SERVER ONLINE");
});
