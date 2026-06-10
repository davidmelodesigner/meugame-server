module.exports = function playerupdate(ws, data,wss) {

    console.log("CLIENT CONNECTED");
    const payload = JSON.stringify({
        message: "playerupdate_echo",
        userid: data.userid,
        x: data.x,
        y: data.y,
        z: data.z,
        rx: data.rx,
        ry: data.ry,
        rz: data.rz
    });

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(payload);
        }
    });
    ws.send(JSON.stringify({
        message: "playerupdate_echo",
        data:data
    }));

};
