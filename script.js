import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

// ===== CONFIG =====
const DB_CONFIG = {
    host: "localhost",
    user: "db_user",
    password: "db_password",
    database: "image_store",
};

const IMAGE_DIR = path.resolve("./uploads"); // pas aan
const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif", "webp"];

// ===== MAIN =====
async function run() {
    const connection = await mysql.createConnection(DB_CONFIG);

    const files = fs.readdirSync(IMAGE_DIR);

    const insertQuery = `
    INSERT INTO images (filename, path, tags)
    VALUES (?, ?, '')
  `;

    for (const file of files) {
        const fullPath = path.join(IMAGE_DIR, file);

        if (!fs.statSync(fullPath).isFile()) continue;

        const ext = path.extname(file).slice(1).toLowerCase();
        if (!ALLOWED_EXT.includes(ext)) continue;

        await connection.execute(insertQuery, [
            file,
            fullPath, // of 'uploads/' + file
        ]);

        console.log(`✔ Ingevoegd: ${file}`);
    }

    await connection.end();
    console.log("Klaar.");
}

run().catch(err => {
    console.error("❌ Fout:", err.message);
});