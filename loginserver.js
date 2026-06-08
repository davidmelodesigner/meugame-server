module.exports = function loginserver(ws, data) {
    console.log("CONECTING USERS");

    ws.send(JSON.stringify({
        message: "login users"
    }));
};
