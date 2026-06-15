const { Pool } = require("pg");

const pool = new Pool({
    connectionString:"postgresql://neondb_owner:npg_qUTQ3o4esZjF@ep-sparkling-pond-apv9ip8u-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: {
        rejectUnauthorized: false
    }
});

async function loginusers(usuario, senha) {

    try {

        const result = await pool.query(
    "SELECT id, nome FROM users WHERE email = $1 AND password = $2 LIMIT 1",
    [usuario, senha]
);

        if (result.rows.length === 0) {
            return {
                success: false
            };
        }

        return {
            success: true,
            id: result.rows[0].id,
            usuario: result.rows[0].usuario
        };

    } catch (err) {

        console.log(err);

        return {
            success: false
        };

    }

}

module.exports = loginusers;
