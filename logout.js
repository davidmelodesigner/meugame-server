
module.exports = function logout(ws, data) {
    ws.send(JSON.stringify({
        message: "quitgame"
    }));
};
