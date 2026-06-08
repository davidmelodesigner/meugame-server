const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Pool } = require("pg");

const app = express();

app.get("/", (req, res) => {
    res.send("Servidor online OK");
});


server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
