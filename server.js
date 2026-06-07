const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

let players = {};

io.on("connection", (socket) => {

    console.log("Jogador conectado:", socket.id);

    players[socket.id] = {
        x: 0,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0
    };

    io.emit("players", players);

    socket.on("updatePlayer", (data) => {

        players[socket.id] = {
            x: data.x,
            y: data.y,
            z: data.z,
            rx: data.rx,
            ry: data.ry,
            rz: data.rz
        };

        io.emit("players", players);
    });

    socket.on("disconnect", () => {

        delete players[socket.id];

        io.emit("players", players);

        console.log("Jogador saiu:", socket.id);
    });

});

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
