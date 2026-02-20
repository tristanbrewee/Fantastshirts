const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "image_store",
    waitForConnections: true,
    connectionLimit: 10
});

// 🛒 Get cart
router.get("/cart-data", async (req, res) => {

    const cart = req.session.cart || [];

    if (cart.length === 0) {
        return res.json({ items: [], total: 0 });
    }

    const ids = cart.map(i => i.id);

    const [products] = await db.query(
        `SELECT id, filename, path, price
         FROM images
         WHERE id IN (?)`,
        [ids]
    );

    const items = [];

    for (const cartItem of cart) {

        const product = products.find(p => p.id === cartItem.id);
        if (!product) continue;

        items.push({
            ...product,
            color: cartItem.color,
            side: cartItem.side,
            quantity: cartItem.quantity,
            subtotal: Number(product.price) * cartItem.quantity
        });
    }

    const total = items.reduce((sum, i) => sum + i.subtotal, 0);

    res.json({ items, total });
});

// ➕ Add to cart
router.post("/add-to-cart", (req, res) => {

    const { id, color, side } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const existing = req.session.cart.find(item =>
        item.id === id &&
        item.color === color &&
        item.side === side
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        req.session.cart.push({
            id: Number(id),
            color,
            side,
            quantity: 1
        });
    }

    console.log("CART:", req.session.cart);

    res.json({ success: true });
});

// 🔁 Update quantity
router.post("/update-cart", (req, res) => {

    const { id, color, side, quantity } = req.body;

    const item = req.session.cart.find(i =>
        i.id == id &&
        i.color === color &&
        i.side === side
    );

    if (item) {
        item.quantity = Number(quantity);
    }

    res.json({ success: true });
});

// ❌ Remove
router.post("/remove-from-cart", (req, res) => {

    const { id, color, side } = req.body;

    req.session.cart = req.session.cart.filter(i =>
        !(i.id == id && i.color === color && i.side === side)
    );

    res.json({ success: true });
});

module.exports = router;