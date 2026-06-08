const { Pool } = require("pg");
const callconfigs = require("./config");

const crypto = require("crypto");

function createUserId(socketId, email) {
    const emailMd5 = crypto
        .createHash("md5")
        .update(email.toLowerCase())
        .digest("hex");

    return `${socketId}_${emailMd5}`;
}

const pool = new Pool({
    connectionString: callconfigs('postgre'),
    ssl: { rejectUnauthorized: false }
});

module.exports = function loginserver(ws, data) {
    console.log("CONECTING USERS");

    async function checkLogin(email, password) {
        try {
            const result = await pool.query(
                "SELECT * FROM users WHERE email = $1 AND password = $2",
                [email, password]
            );

            if (result.rows.length > 0) {
                const socketId = crypto.randomUUID();

                const userId = createUserId(socketId, data.email);
                
                ws.send(JSON.stringify({
                    message: "userconnected",
                    userid: userId
                }));
            } else {
                ws.send(JSON.stringify({
                    message: "loginfailed"
                }));
            }

        } catch (err) {
            console.log("Erro login:", err);
        }
    }

    checkLogin(data.email, data.password);
};
