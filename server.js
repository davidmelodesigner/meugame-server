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

                if (resultado.success) {

                    ws.userId = "user_" + resultado.id;

                    users[ws.userId] = {
                        id: ws.userId,
                        nome: resultado.usuario,
                        x: 200,
                        y: 200,
                        anim: null
                    };

                    ws.send(JSON.stringify({
                        message: "login",
                        success: true,
                        id: ws.userId,
                        nome: resultado.usuario
                    }));

                    enviarUsuarios();

                } else {

                    ws.send(JSON.stringify({
                        message: "login",
                        success: false
                    }));

                }

                return;
            }
            // ---------------- LOGOUT ----------------
            if (data.message === "disconnecting") {
            
                if (!ws.userId) return;
            
                console.log("Logout solicitado:", ws.userId);
            
                // remove do sistema
                delete users[ws.userId];
            
                // avisa o cliente que pode sair
                ws.send(JSON.stringify({
                    message: "disconnected",
                    success: true
                }));
            
                // fecha conexão
                ws.close();
            
                // atualiza outros players
                enviarUsuarios();
            
                return;
            }
            // ---------------- UPDATE PLAYER ----------------
            if (data.message === "updateplayer") {

                if (!users[ws.userId]) return;

                users[ws.userId].x = data.x;
                users[ws.userId].y = data.y;
                users[ws.userId].anim = data.anim;

                enviarUsuarios();

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
