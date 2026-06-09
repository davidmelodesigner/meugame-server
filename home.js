
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const callconfigs = require("./config");

module.exports = function homepage(ws, data) {
    ws.send(JSON.stringify({
        message: "serverconnected"
    }));
};
