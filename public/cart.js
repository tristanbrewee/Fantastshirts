document.addEventListener("DOMContentLoaded", async () => {

    const res = await fetch("/cart-data");
    const data = await res.json();

    const container = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");

    if (data.items.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    container.innerHTML = data.items.map(item => `
    <div class="cart-item">
        <img src="/${item.path}">
        <div>
            <strong>${item.filename}</strong><br>
            Color: ${item.color}<br>
            Side: ${item.side}
        </div>
        <div>€${item.price}</div>
        <div>
            <input type="number" min="1" value="${item.quantity}"
                   data-id="${item.id}"
                   data-color="${item.color}"
                   data-side="${item.side}"
                   class="qty-input">
        </div>
        <button 
            data-id="${item.id}"
            data-color="${item.color}"
            data-side="${item.side}"
            class="remove-btn">X</button>
    </div>
`).join("");

    totalEl.textContent = data.total.toFixed(2);

    // Update quantity
    document.querySelectorAll(".qty-input").forEach(input => {
        input.addEventListener("change", async () => {
            await fetch("/update-cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: input.dataset.id,
                    color: input.dataset.color,
                    side: input.dataset.side,
                    quantity: input.value
                })
            });
            location.reload();
        });
    });

    // Remove
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            await fetch("/remove-from-cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: btn.dataset.id,
                    color: btn.dataset.color,
                    side: btn.dataset.side
                })
            });
            location.reload();
        });
    });

});