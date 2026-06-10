module.exports = function inicServer(ws, data) {

    console.log("CLIENT CONNECTED");

    ws.send(JSON.stringify({
        message: "playerupdate_echo",
        data:data
    }));

};
