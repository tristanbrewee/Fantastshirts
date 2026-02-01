document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const formData = new URLSearchParams(new FormData(form));

        const res = await fetch("/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const result = await res.json();

        if (res.ok) {
            alert("📨 Your message has been sent!");
            form.reset();
            if (window.grecaptcha) grecaptcha.reset();
        } else {
            alert("❌ " + result.error);
        }
    });
});