const express = require("express");
const mysql = require("mysql2/promise");

async function startServer() {
    const app = express();

    const db = await mysql.createConnection({
        host: "localhost",
        user: "root",          // pas aan
        password: "root",          // pas aan
        database: "image_store"
    });

    console.log("✅ Verbonden met MySQL");

    app.use(express.static("public"));

    app.get("/product/:id", async (req, res) => {
        const id = req.params.id;

        const [rows] = await db.execute(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        res.json(rows[0]);
    });

    app.get("/data", async (req, res) => {
        console.log("QUERY PARAMS:", req.query);
        try {
            const tags = req.query.tags;

            let rows;

            if (tags) {
                const parts = tags
                    .split(",")
                    .map(t => t.trim().toLowerCase())
                    .filter(Boolean);

                const conditions = parts
                    .map(() => "LOWER(tags) LIKE ?")
                    .join(" AND ");

                const values = parts.map(t => `%${t}%`);

                [rows] = await db.query(
                    `SELECT * FROM images WHERE ${conditions}`,
                    values
                );
            } else {
                [rows] = await db.query("SELECT * FROM images");
            }

            res.json(rows);
        } catch (err) {
            console.error("❌ Database fout:", err);
            res.status(500).json({ error: "Database fout" });
        }
    });

    app.listen(3000, () =>
        console.log("🚀 Server draait op http://localhost:3000")
    );

    app.get("/images/:id", async (req, res) => {
        const id = req.params.id;

        try {
            const [rows] = await db.execute(
                "SELECT * FROM images WHERE id = ?",
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "Image not found" });
            }

            res.json(rows[0]);
        } catch (err) {
            console.error("DB fout:", err);
            res.status(500).json({ error: "Database error" });
        }
    });
}

startServer().catch(err => {
    console.error("❌ Server fout:", err);
});