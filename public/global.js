document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("search");

    if (!input) return; // voorkomt errors op pagina’s zonder search

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
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

});