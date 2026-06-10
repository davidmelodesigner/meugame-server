const onlineUsers = new Map();

function registerUser(ws, userId) {
    ws.userId = userId;
    onlineUsers.set(userId, ws);
}

function handlePlayerUpdate(ws, data) {

    const userId = data.userid;

    if (!userId) {
        console.log("PLAYERUPDATE SEM USERID");
        return;
    }

    ws.userId = userId;
    onlineUsers.set(userId, ws);

    const payload = {
        message: "playerupdate_echo",
        userid: userId,
        x: data.x,
        y: data.y,
        z: data.z,
        rx: data.rx,
        ry: data.ry,
        rz: data.rz
    };

    console.log("ENVIANDO PRO UPBGE:", payload);

    ws.send(JSON.stringify(payload));
}

module.exports = {
    handlePlayerUpdate,
    registerUser,
    onlineUsers
};
