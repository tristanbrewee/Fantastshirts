document.addEventListener("DOMContentLoaded", () => {

    const base = document.getElementById("shirtBase");
    const print = document.getElementById("shirtPrint");

    if (!base || !print) return;

    const params = new URLSearchParams(window.location.search);
    const imageId = params.get("id");


    if (!productId) {
        console.error("Geen product ID in URL");
        return;
    }

    const state = {
        color: "black",
        side: "front",
        print: null
    };

    function updateBase() {
        base.src = `/img/shirt_${state.color}_${state.side}.png`;
    }

    function updatePrint() {
        if (!state.print) return;

        // express.static("public")
        print.src = `/${state.print}`;
    }

    // 🔹 Product ophalen uit DB
    fetch(`/images/${imageId}`)
        .then(res => {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(image => {
            console.log("Image uit DB:", image);

            // 🔥 HIER komt je overlay vandaan
            state.print = image.path;
            updatePrint();
        })
        .catch(err => {
            console.error("Image ophalen mislukt:", err);
        });

    // 🔘 kleur / zijde
    document.addEventListener("change", (e) => {
        if (e.target.name === "color") {
            state.color = e.target.value;
            updateBase();
        }

        if (e.target.name === "side") {
            state.side = e.target.value;
            updateBase();
        }
    });

});