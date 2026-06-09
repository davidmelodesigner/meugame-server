const express = require("express");
const http = require("http");

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

app.get("/inicserver", (req, res) => {
    inicServer(req, res);
});

const server = http.createServer(app);

server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor online");
});
