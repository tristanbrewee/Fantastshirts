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

                this.disabled = true;
                this.textContent = "Processing...";

                const res = await fetch("/checkout", {
                    method: "POST",
                    credentials: "include"
                });

                const data = await res.json();

                // 🔥 BELANGRIJK
                if (!res.ok) {

                    if (data.message === "NO_VALID_ADDRESS") {
                        alert("Please add a valid address before proceeding.");
                        window.location.href = "/account.html?error=address_required";
                        return;
                    }

                    this.textContent = "Checkout failed";
                    this.disabled = false;
                    return;
                }

                // Alleen als checkout écht success was
                this.textContent = "Order Created ✓";

                document.getElementById("orderRef")
                    .textContent = data.orderId;

                document.getElementById("bankInfo")
                    .style.display = "block";
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