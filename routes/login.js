const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const session = require("express-session");

const router = express.Router();

/* ========================= */
/* DATABASE (POOL IS BETTER) */
/* ========================= */

const db = mysql.createPool({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "image_store",
    waitForConnections: true,
    connectionLimit: 10
});

router.get("/me", (req, res) => {
    if (!req.session.userId) {
        return res.json({ loggedIn: false });
    }

    res.json({
        loggedIn: true,
        email: req.session.email
    });
});

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login.html");
    }
    next();
}


/* ========================= */
/* LOGIN */
/* ========================= */

router.post("/login", async (req, res) => {
    try {
        console.log("LOGIN ROUTE HIT");
        console.log("BODY:", req.body);

        const { password } = req.body;
        let email = req.body.email;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        email = email.toLowerCase().trim();

        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const user = rows[0];

        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        req.session.userId = user.id;
        req.session.email = user.email;

        console.log("SESSION AFTER LOGIN: ", req.session);

        return res.redirect("/");

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

/* ========================= */
/* REGISTER */
/* ========================= */

router.post("/register", async (req, res) => {
    try {
        console.log("REGISTER ROUTE HIT");
        console.log("BODY:", req.body);

        if (!req.body) {
    return res.status(400).json({ message: "No form data received" });
}

    let { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        email = email.toLowerCase().trim();

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const [existing] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            [email, hash]
        );

        const [newUser] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        req.session.userId = newUser[0].id;
        req.session.email = email;

        return res.status(201).json({
            message: "Registration successful"
        });

    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

/* ========================= */
/* LOGOUT */
/* ========================= */

router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

module.exports = router;