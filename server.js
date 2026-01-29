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

    app.get("/data", async (req, res) => {
        const [rows] = await db.query("SELECT * FROM images");
        res.json(rows);
    });

    app.listen(3000, () =>
        console.log("🚀 Server draait op http://localhost:3000")
    );
}

startServer().catch(err => {
    console.error("❌ Server fout:", err);
});