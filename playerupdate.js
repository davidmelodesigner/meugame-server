module.exports = function inicServer(ws, data) {

    console.log("CLIENT CONNECTED");

    ws.send(JSON.stringify({
        message: "serverconnected",
        data:data
    }));

};
