const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Pool } = require("pg");

const app = express();

app.get("/", (req, res) => {
    res.send("Servidor online OK");
});

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_qUTQ3o4esZjF@ep-sparkling-pond-apv9ip8u-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = {};

async function checkLogin(email, password) {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND password = $2",
        [email, password]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
}

function broadcastPlayers() {

    const filtered = {};

    for (const id in players) {
        if (players[id].logged) {
            filtered[id] = players[id];
        }
    }

    const data = JSON.stringify({
        type: "players",
        data: filtered
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

setInterval(broadcastPlayers, 66);

setInterval(() => {
    const now = Date.now();

    for (const id in players) {
        if (now - players[id].lastSeen > 5000) {
            delete players[id];
        }
    }
}, 1000);

wss.on("connection", (ws) => {

    let logged = false;
    let id = null;

    ws.on("message", async (msg) => {

        const data = JSON.parse(msg);

        // ---------------- LOGIN ONLY ----------------
        if (data.type === "login") {

            const user = await checkLogin(data.email, data.password);

            if (!user) {
                ws.send(JSON.stringify({
                    type: "login_result",
                    success: false
                }));
                return;
            }

            logged = true;
            id = Math.random().toString(36).substr(2, 9);

            players[id] = {
                x: 0, y: 0, z: 0,
                rx: 0, ry: 0, rz: 0,
                lastSeen: Date.now(),
                logged: true,
                userId: user.id,
                email: user.email
            };

            ws.send(JSON.stringify({
                type: "login_result",
                success: true,
                id: user.id,
                email: user.email,
                nome: user.nome
            }));

            return;
        }

        // ---------------- BLOCK IF NOT LOGGED ----------------
        if (!logged) return;

        // ---------------- UPDATE ONLY AFTER LOGIN ----------------
        if (data.type === "update" && id) {

            const p = data.data;

            if (!players[id]) return;

            players[id].x = p.x ?? players[id].x;
            players[id].y = p.y ?? players[id].y;
            players[id].z = p.z ?? players[id].z;

            players[id].rx = p.rx ?? players[id].rx;
            players[id].ry = p.ry ?? players[id].ry;
            players[id].rz = p.rz ?? players[id].rz;

            players[id].lastSeen = Date.now();
        }
    });

    ws.on("close", () => {
        if (id && players[id]) {
            delete players[id];
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
