module.exports = function logout(ws, data, wss) {

    const userId = data.userid || ws.userId;

    if (!userId) return;

    console.log("USER DESCONECTOU:", userId);

    ws.userId = null;

    const payload = JSON.stringify({
        message: "userdisconnect",
        userid: userId
    });

    wss.clients.forEach(client => {

        if (client.readyState === 1) {

            if (client.userId === userId) {
                client.userId = null;
            }

            client.send(payload);
        }
    });
};
