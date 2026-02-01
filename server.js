require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

async function startServer() {


    const db = await mysql.createConnection({
        host: "localhost",
        user: "root",          // pas aan
        password: "root",          // pas aan
        database: "image_store"
    });

    console.log("✅ Verbonden met MySQL");

    /* MAIL CONFIG */
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    /* CONTACT FORM */
    app.post("/contact", async (req, res) => {
        try {
            if (!req.body) {
                console.error("❌ req.body is undefined");
                return res.status(400).json({ error: "No form data received" });
            }

            const {
                email,
                subject,
                message,
                "g-recaptcha-response": captcha
            } = req.body;

            console.log("BODY:", req.body);

            if (!email || !subject || !message) {
                return res.status(400).json({ error: "Missing fields" });
            }

            if (!captcha) {
                return res.status(400).json({ error: "Captcha missing" });
            }

            // captcha verify
            const response = await fetch(
                "https://www.google.com/recaptcha/api/siteverify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`
                }
            );

            const captchaResult = await response.json();

            if (!captchaResult.success) {
                return res.status(403).json({ error: "Captcha failed" });
            }

            // mail
            await transporter.sendMail({
                from: `"Fantas-T-Shirts" <${process.env.MAIL_USER}>`,
                to: "tristanbrewee@fantas-t-shirts.com",
                replyTo: email,
                subject: `[Contact] ${subject}`,
                html: `
                <p><strong>From:</strong> ${email}</p>
                <p>${message.replace(/\n/g, "<br>")}</p>
            `
            });

            res.json({ success: true });

        } catch (err) {
            console.error("❌ CONTACT ROUTE ERROR:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

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

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

startServer().catch(err => {
    console.error("❌ Server fout:", err);
});