document.getElementById("guestForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = new FormData(this);

        const data = Object.fromEntries(formData.entries());

        const res = await fetch("/guest-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!result.success) {
            alert("Checkout failed");
            return;
        }

        document.getElementById("orderRef")
            .textContent = result.orderId;

        document.getElementById("bankInfo")
            .style.display = "block";

        this.style.display = "none";
    });