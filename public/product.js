document.addEventListener("DOMContentLoaded", () => {

    const base = document.getElementById("shirtBase");
    const print = document.getElementById("shirtPrint");

    if (!base || !print) {
        console.error("Base of print image ontbreekt in DOM");
        return;
    }

    // ✅ ID UIT URL HALEN — DIT MOET EERST
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    console.log("URL productId =", productId);

    if (!productId) {
        console.error("Geen product ID in URL");
        return;
    }

    const state = {
        color: "zwart",
        side: "front",
        print: null
    };

    function updateBase() {
        base.src = `/shirts/shirt_${state.color}_${state.side}.png`;
    }

    updateBase();

    function updatePrint() {
        if (!state.print) {
            console.error("Geen print path in state");
            return;
        }

        console.log("STATE.PRINT =", state.print);
        print.src = `/${state.print}`;
    }

    // 🔹 IMAGE OPHALEN UIT DB
    fetch(`/images/${productId}`)
        .then(res => {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(image => {
            console.log("IMAGE UIT DB =", image);

            state.print = image.path; // bv "img/skull.png"
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