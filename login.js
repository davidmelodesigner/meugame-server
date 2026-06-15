const { Pool } = require("pg");
const evenconfig = require("./evenconfig.js");

const pool = new Pool({
    connectionString: evenconfig(),
    ssl: {
        rejectUnauthorized: false
    }
});

// ---------------- LOGIN ----------------
async function loginusers(usuario, senha, ws) {
    try {
        const result = await pool.query(
            "SELECT id, nome FROM users WHERE email = $1 AND password = $2 LIMIT 1",
            [usuario, senha]
        );

        if (result.rows.length === 0) {
            ws.send(JSON.stringify({
                message: "login_failed"
            }));

            return { success: false };
        }

        const userobj = {
            id: result.rows[0].id,
            nome: result.rows[0].nome
        };

        ws.send(JSON.stringify({
            message: "userlogued",
            userdata: userobj
        }));

        return {
            success: true,
            userdata: userobj
        };

    } catch (err) {
        console.log(err);

        ws.send(JSON.stringify({
            message: "errorserver"
        }));

        return { success: false };
    }
}

// ---------------- DISCONNECT ----------------
async function logidesconect(userid, ws) {
    try {
        ws.send(JSON.stringify({
            message: "userdisconnect",
            userid: userid
        }));

        return { success: true };

    } catch (err) {
        console.log(err);

        return { success: false };
    }
}

// ---------------- EXPORT ----------------
module.exports = {
    loginusers,
    logidesconect
};
