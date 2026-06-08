const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_qUTQ3o4esZjF@ep-sparkling-pond-apv9ip8u-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
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
