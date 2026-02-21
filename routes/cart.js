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

router.post("/checkout", async (req, res) => {

    const cart = req.session.cart || [];

    if (cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }

    const ids = cart.map(i => i.id);

    const [products] = await db.query(
        `SELECT id, price FROM images WHERE id IN (?)`,
        [ids]
    );

    let total = 0;

    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        total += Number(product.price) * item.quantity;
    }

    const [orderResult] = await db.execute(
        `INSERT INTO orders (user_id, total) VALUES (?, ?)`,
        [userId, total]
    );

    const orderId = orderResult.insertId;

    for (const item of cart) {
        const product = products.find(p => p.id === item.id);

        await db.execute(
            `INSERT INTO order_items 
            (order_id, product_id, color, side, quantity, price)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                orderId,
                item.id,
                item.color,
                item.side,
                item.quantity,
                product.price
            ]
        );
    }

    req.session.cart = [];

    res.json({
        success: true,
        orderId,
        total
    });
});

router.post("/guest-checkout", async (req, res) => {

    const cart = req.session.cart || [];

    if (cart.length === 0) {
        return res.status(400).json({ message: "Cart empty" });
    }

    const {
        email,
        street,
        house_number,
        city,
        state,
        country
    } = req.body;

    const ids = cart.map(i => i.id);

    const [products] = await db.query(
        `SELECT id, price FROM images WHERE id IN (?)`,
        [ids]
    );

    let total = 0;

    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        total += Number(product.price) * item.quantity;
    }

    const [orderResult] = await db.execute(
        `INSERT INTO orders
        (user_id, total, guest_email, street, house_number, city, state, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            null,
            total,
            email,
            street,
            house_number,
            city,
            state,
            country
        ]
    );

    const orderId = orderResult.insertId;

    for (const item of cart) {
        const product = products.find(p => p.id === item.id);

        await db.execute(
            `INSERT INTO order_items
            (order_id, product_id, color, side, quantity, price)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                orderId,
                item.id,
                item.color,
                item.side,
                item.quantity,
                product.price
            ]
        );
    }

    req.session.cart = [];

    res.json({
        success: true,
        orderId,
        total
    });
});

module.exports = router;