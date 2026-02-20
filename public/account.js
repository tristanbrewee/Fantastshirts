console.log("ACCOUNT.JS LOADED");

document.addEventListener("DOMContentLoaded", async () => {

    try {
        const res = await fetch("/account-data", {
            credentials: "include"
        });

        if (!res.ok) {
            console.error("Failed to fetch account data");
            return;
        }

        const data = await res.json();
        const addr = data.address;

        const addressBlock = document.getElementById("addressBlock");

        if (!addr || (!addr.street && !addr.city)) {
            addressBlock.innerHTML = `
        <div class="address-display">
            <div class="address-line">
                No address saved yet.
            </div>
        </div>
    `;
            return;
        }

        addressBlock.innerHTML = `
    <div class="address-display">
        <div class="address-line">
            ${addr.street || ""} ${addr.house_number || ""}
        </div>
        <div class="address-line">
            ${addr.city || ""}
        </div>
        <div class="address-line">
            ${addr.state || ""}
        </div>
        <div class="address-line">
            ${addr.country || ""}
        </div>
    </div>
`;

    } catch (err) {
        console.error("Frontend account error:", err);
    }

});