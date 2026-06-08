
module.exports = function logout(ws, data) {
    console.log("LOGOUT EXECUTADO");

    ws.send(JSON.stringify({
        message: "quitgame"
    }));
};
