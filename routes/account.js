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

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login.html");
    }
    next();
}

router.get("/account-data", requireAuth, async (req, res) => {

    console.log("ACCOUNT ROUTE ACTIVE");

    const userId = req.session.userId;

    const [rows] = await db.execute(
        `SELECT street, house_number, city, state, country
         FROM users
         WHERE id = ?`,
        [userId]
    );

    res.json({
        address: rows[0]
    });
});

router.post("/update-address", requireAuth, async (req, res) => {

    const { street, house_number, city, state, country } = req.body;

    try {
        await db.execute(
            `UPDATE users
             SET street=?, house_number=?, city=?, state=?, country=?
             WHERE id=?`,
            [
                street,
                house_number,
                city,
                state,
                country,
                req.session.userId
            ]
        );

        res.redirect("/account.html");

    } catch (err) {
        console.error("Update address error:", err);
        res.status(500).send("Failed to update address");
    }
});

module.exports = router;