document.addEventListener("DOMContentLoaded", async () => {

    const res = await fetch("/me");
    const data = await res.json();

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

    // Logout click
    logoutItem.addEventListener("click", async (e) => {
        e.preventDefault();
        await fetch("/logout", { method: "POST" });
        location.reload();
    });

});