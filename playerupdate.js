const onlineUsers = new Map();

function registerUser(ws, userId) {
    ws.userId = userId;
    onlineUsers.set(userId, ws);
}

function handlePlayerUpdate(ws, data) {

    const userId = data.userid;

    if (!userId) return;

    ws.userId = userId;
    onlineUsers.set(userId, ws);

    const payload = {
        message: "updateplayer",
        userid: userId,
        x: data.x,
        y: data.y,
        z: data.z,
        rx: data.rx,
        ry: data.ry,
        rz: data.rz
    };

    for (const [id, client] of onlineUsers) {
        if (id === userId) continue;

        if (client.readyState === 1) {
            client.send(JSON.stringify(payload));
        }
    }
}

module.exports = {
    handlePlayerUpdate,
    registerUser,
    onlineUsers
};
