console.log("JS BESTAND GELADEN");

document.addEventListener("DOMContentLoaded", () => {

    // 🔹 tag uit pagina-URL halen (?tag=osrs)
    const params = new URLSearchParams(window.location.search);
    const tags = params.get("tags");
    const id = params.get("id");

    const url = tags ? `/data?tags=${encodeURIComponent(tags)}` : "/data";

    const input = document.getElementById("search");

    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-id]");
        if (!btn) return;

        const id = btn.dataset.id;
        window.location.href = `product.html?id=${id}`;
    });

    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const words = input.value
                .trim()
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);

            if (words.length === 0) return;

            window.location.href =
                `/?tags=${encodeURIComponent(words.join(","))}`;
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-btn")) {
            const id = e.target.dataset.id;
            window.location.href = `product.html?id=${id}`;
        }
    });

    fetch(url)
        .then(r => r.json())
        .then(data => {

            const grid = document.getElementById("imagelist");

            if (!grid) {
                console.error("#imagelist niet gevonden");
                return;
            }

            if (!data || data.length === 0) {
                grid.innerHTML = "<p>Geen data gevonden</p>";
                return;
            }

            let html = "";

            data.forEach(item => {
                const tags = item.tags ?? "";

                html += `
                    <div class="card">
                        <img src="${item.path}" alt="${item.filename}">
                        <div class="card-body">
                            <h2>${item.filename}</h2>
                            <p>${tags}</p>
                            <div class="price"></div>
                            <button data-id="${item.id}">To product page</button>
                        </div>
                    </div>
                `;
            });

            grid.innerHTML = html;
        })
        .catch(err => console.error("Fetch fout:", err));

});