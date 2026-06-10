const { Pool } = require("pg");
const callconfigs = require("./config");

const pool = new Pool({
    connectionString: callconfigs("postgre"),
    ssl: { rejectUnauthorized: false }
});

// 🔥 AQUI (global do módulo)
const onlineUsers = new Map();

module.exports = function userslogued(ws, data) {
    const userId = data.userid;

    if (!userId) return;

    ws.userId = userId;

    // se quiser evitar duplicado (recomendado)
    if (onlineUsers.has(userId)) {
        try {
            onlineUsers.get(userId).close();
        } catch (e) {}
    }

    onlineUsers.set(userId, ws);

    console.log("USER LOGADO:", userId);

    ws.send(JSON.stringify({
        message: "userconnected",
        userid: userId
    }));
};
