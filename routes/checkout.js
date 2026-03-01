router.post("/checkout", async (req, res) => {

    const cart = req.session.cart || [];

    if (cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }

    const { paymentMethod } = req.body;

    if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method required" });
    }

    const selectedMethod = document.querySelector(
        'input[name="paymentMethod"]:checked'
    )?.value;

    if (!selectedMethod) {
        alert("Please select a payment method.");
        return;
    }

    // 🔎 Address check (laat staan zoals je had)

    const [userRows] = await db.execute(
        `SELECT street, house_number, city, state, country 
         FROM users WHERE id = ?`,
        [userId]
    );

    const user = userRows[0];

    const hasValidAddress =
        user &&
        user.street && user.street.trim() !== "" &&
        user.house_number && user.house_number.trim() !== "" &&
        user.city && user.city.trim() !== "" &&
        user.country && user.country.trim() !== "";

    if (!hasValidAddress) {
        return res.status(400).json({
            message: "NO_VALID_ADDRESS"
        });
    }

    // 🔎 Calculate total

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

    // 🧾 Create order

    const [orderResult] = await db.execute(
        `INSERT INTO orders (user_id, total) VALUES (?, ?)`,
        [userId, total]
    );

    const orderId = orderResult.insertId;

    // 🧾 Insert order items

    for (const item of cart) {
        const product = products.find(p => p.id === item.id);

        await db.execute(
            `INSERT INTO order_items
             (order_id, product_id, color, side, size, quantity, price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                orderId,
                item.id,
                item.color,
                item.side,
                item.size,
                item.quantity,
                product.price
            ]
        );
    }

    // 💳 Payment simulation

    let paymentStatus = "pending";

    if (paymentMethod === "test" ||
        paymentMethod === "visa" ||
        paymentMethod === "paypal") {
        paymentStatus = "paid";
    }

    await db.execute(
        `UPDATE orders
         SET payment_method = ?, payment_status = ?
         WHERE id = ?`,
        [paymentMethod, paymentStatus, orderId]
    );

    req.session.cart = [];

    res.json({
        success: true,
        orderId,
        paymentStatus
    });
});