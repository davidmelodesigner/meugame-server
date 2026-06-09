


module.exports = function homepage(ws, data) {
    ws.send(JSON.stringify({
        message: "serverconnected"
    }));
};
