document.addEventListener("DOMContentLoaded", async () => {

    try {
        const res = await fetch("/categories-data");
        const tags = await res.json();

        const container = document.getElementById("categoriesList");

        if (!tags || tags.length === 0) {
            container.innerHTML = "<p>No categories found.</p>";
            return;
        }

        let html = "";

        tags.forEach(tag => {
            html += `
                <label>
                    <input type="checkbox" value="${tag}">
                    ${tag}
                </label>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Categories error:", err);
    }

    // Submit handler
    const form = document.getElementById("categoriesForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const selected = Array.from(
            form.querySelectorAll("input[type='checkbox']:checked")
        ).map(cb => cb.value);

        if (selected.length === 0) return;

        window.location.href =
            `/?tags=${encodeURIComponent(selected.join(","))}`;
    });

});