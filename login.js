const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function loginusers(usuario, senha) {

    try {

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2 LIMIT 1",
            [usuario, senha]
        );

        if (result.rows.length > 0) {

            return {
                success: true,
                usuario: result.rows[0]
            };

        }

        return {
            success: false
        };

    } catch (err) {

        console.log(err);

        return {
            success: false,
            erro: err.message
        };

    }

}

module.exports = loginusers;
