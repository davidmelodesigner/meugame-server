const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function loginusers(req, res) {

    try {

        const { usuario, senha } = req.body;

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE usuario=$1 AND senha=$2 LIMIT 1",
            [usuario, senha]
        );

        if (result.rows.length > 0) {

            return res.json({
                success: true
            });

        }

        res.json({
            success: false
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false
        });

    }

}

module.exports = loginusers;
