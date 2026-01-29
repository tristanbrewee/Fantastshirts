console.log("JS BESTAND GELADEN");

document.addEventListener("DOMContentLoaded", () => {

    fetch("/data")
        .then(r => r.json())
        .then(data => {

            const grid = document.getElementById("imagelist");

            if (!grid) {
                console.error("#imagelist niet gevonden");
                return;
            }

            if (data.length === 0) {
                grid.innerHTML = "<p>Geen data gevonden</p>";
                return;
            }

            let html = "";

            data.forEach(item => {

                // tags zijn een string → gewoon tonen
                const tags = item.tags ? item.tags : "";

                html += `
                    <div class="card">
                        <img src="${item.path}" alt="${item.filename}">
                        <div class="card-body">
                            <h2>${item.filename}</h2>
                            <p>${tags}</p>
                            <div class="price"></div>
                            <button>Naar product pagina</button>
                        </div>
                    </div>
                `;
            });

            // 👇 DIT WAS DE BELANGRIJKSTE REGEL
            grid.innerHTML = html;

        })
        .catch(err => console.error("Fetch fout:", err));

});