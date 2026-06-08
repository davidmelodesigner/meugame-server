const { Pool } = require("pg");
const crypto = require("crypto");

const callconfigs = require("./config");

function createUserId(email) {
    const emailMd5 = crypto
        .createHash("md5")
        .update(email.toLowerCase())
        .digest("hex");

    const sessionId = crypto.randomUUID();

    return `${sessionId}_${emailMd5}`;
}

const pool = new Pool({
    connectionString: callconfigs("postgre"),
    ssl: { rejectUnauthorized: false }
});

module.exports = function loginserver(ws, data) {

    async function checkLogin(email, password) {

        try {

            const result = await pool.query(
                "SELECT * FROM users WHERE email = $1 AND password = $2",
                [email, password]
            );

            if (result.rows.length > 0) {

                const userId = createUserId(email);

                ws.send(JSON.stringify({
                    message: "userconnected",
                    userid: userId,
                    email: email
                }));

            } else {

                console.log("LOGIN FAILED");

                ws.send(JSON.stringify({
                    message: "loginfailed"
                }));

            }

        } catch (err) {

            console.log("Erro login:", err);

            ws.send(JSON.stringify({
                message: "servererror"
            }));

        }
    }

    checkLogin(data.email, data.password);
};
