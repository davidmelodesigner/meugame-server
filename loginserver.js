const { Pool } = require("pg");
const callconfigs = require("./config");

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
                ws.send(JSON.stringify({
                    message: "userconnected",
                    email: data.email
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
