const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "SUA_CONNECTION_STRING",
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {

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

};
