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

// Usuários conectados
const users = {};

// ---------------- CONNECTION ----------------
wss.on("connection", (ws) => {

    ws.on("message", async (msg) => {

        try {

            const data = JSON.parse(msg.toString());
 
            switch (data.message) {
				  case "testconnection":
				    ws.send(JSON.stringify({
                        message: "connected",
                        success: false
                    }));
				    break;
				   case "login":
				    loginusers(req, resp,ws);
				    break;
				}

        } catch (err) {

            console.log(err);

            ws.send(JSON.stringify({
                message: "errorserver",
                success: false
            }));

        }

    });

    ws.on("close", () => {

        console.log("Cliente desconectado.");

        delete users[ws.userId];

        enviarUsuarios();

    });

});

// ---------------- ENVIAR USUÁRIOS ----------------
function enviarUsuarios() {

    wss.clients.forEach(cliente => {

        if (cliente.readyState !== WebSocket.OPEN) return;
        if (!cliente.userId) return;

        const lista = [];

        for (const id in users) {

            if (id === cliente.userId) continue;

            lista.push(users[id]);

        }

        cliente.send(JSON.stringify({
            message: "players",
            players: lista
        }));

    });

}

// ---------------- START ----------------
server.listen(process.env.PORT || 3000, () => {

    console.log("SERVER ONLINE");

});
