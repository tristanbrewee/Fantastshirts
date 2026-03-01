document.addEventListener("DOMContentLoaded", async () => {

    const res = await fetch("/cart-data", {
        credentials: "include"
    });

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
        document.getElementById("checkoutContainer").innerHTML =
            "<p>Your cart is empty.</p>";
        return;
    }

    const container = document.getElementById("orderSummary");

    container.innerHTML = data.items.map(item => `
    <div class="checkout-item">
        <img src="/${item.path}" class="checkout-img">

        <div class="checkout-info">
            <strong>${item.filename}</strong>
            <div class="checkout-meta">
                Color: ${item.color}<br>
                Side: ${item.side}<br>
                Size: ${item.size}<br>
                Qty: ${item.quantity}
            </div>
        </div>

        <div class="checkout-price">
            €${item.subtotal.toFixed(2)}
        </div>
    </div>
`).join("");

    document.getElementById("checkoutTotal")
        .textContent = data.total.toFixed(2);
});



document.addEventListener("DOMContentLoaded", async () => {

    const actions = document.getElementById("checkoutActions");

    // 🔎 Check login status
    const authRes = await fetch("/me", {
        credentials: "include"
    });

    const authData = await authRes.json();

    // 🔎 Check cart
    const cartRes = await fetch("/cart-data", {
        credentials: "include"
    });

    const cartData = await cartRes.json();

    if (!cartData.items || cartData.items.length === 0) {
        actions.innerHTML = `
            <button class="confirm-btn" disabled>
                Cart is empty
            </button>
        `;
        return;
    }

    // 🟢 USER IS LOGGED IN
    if (authData.loggedIn) {

        actions.innerHTML = `
            <button id="confirmCheckout" class="confirm-btn">
                Proceed to Payment (€${cartData.total.toFixed(2)})
            </button>
        `;

        document.getElementById("confirmCheckout")
            .addEventListener("click", async function () {

                // 🔎 Haal geselecteerde betaalmethode op
                const selectedMethod = document.querySelector(
                    'input[name="paymentMethod"]:checked'
                )?.value;

                if (!selectedMethod) {
                    alert("Please select a payment method.");
                    return;
                }

                this.disabled = true;
                this.textContent = "Processing...";

                const res = await fetch("/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        paymentMethod: selectedMethod
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert("Checkout failed");
                    this.disabled = false;
                    this.textContent = "Proceed to Payment";
                    return;
                }

                // 🔥 Redirect op basis van betaling
                if (data.paymentStatus === "paid") {
                    window.location.href =
                        `/payment-success.html?order=${data.orderId}`;
                } else {
                    window.location.href =
                        `/payment-pending.html?order=${data.orderId}`;
                }
            });
    }

    // 🔴 USER IS NOT LOGGED IN
    else {

        actions.innerHTML = `
            <button id="guestCheckout" class="confirm-btn">
                Proceed as Guest
            </button>

            <a href="/login.html" class="confirm-btn"
               style="margin-left:15px; text-decoration:none;">
                Register or Login
            </a>
        `;

        document.getElementById("guestCheckout")
            .addEventListener("click", () => {

                // Later kunnen we hier guest-checkout doen
                window.location.href = "/guest-checkout.html";
            });
    }


});

