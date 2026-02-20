const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();
const db = mysql.createPool({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "image_store",
    waitForConnections: true,
    connectionLimit: 10
});

router.get("/categories-data", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT tags FROM images WHERE tags IS NOT NULL"
        );

        const tagSet = new Set();

        rows.forEach(row => {
            if (!row.tags) return;

            row.tags
                .split(";")
                .map(t =>
                    t
                        .replace(/['",]/g, "")  // verwijdert ' en "
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean)
                .forEach(tag => tagSet.add(tag));
        });

        const uniqueTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

        res.json(uniqueTags);

    } catch (err) {
        console.error("Categories error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;