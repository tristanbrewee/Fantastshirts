document.addEventListener("DOMContentLoaded", async () => {

    try {
        const res = await fetch("/me", {
            credentials: "include"
        });

        const data = await res.json();

        console.log("Response from /me:", data);

        const loginItem = document.getElementById("loginItem");
        const accountItem = document.getElementById("accountItem");
        const logoutItem = document.getElementById("logoutItem");

        if (data.loggedIn) {
            loginItem.style.display = "none";
            accountItem.style.display = "inline";
            logoutItem.style.display = "inline";
        } else {
            loginItem.style.display = "inline";
            accountItem.style.display = "none";
            logoutItem.style.display = "none";
        }

        logoutItem.addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch("/logout", {
                method: "POST",
                credentials: "include"
            });
            location.reload();
        });

    } catch (err) {
        console.error("UI error:", err);
    }
});