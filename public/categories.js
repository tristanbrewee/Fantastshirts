document.addEventListener("DOMContentLoaded", () => {

    const categories = [
        "Avatar",
        "Samurai Jack",
        "The Lord of the Rings",
        "World of Warcraft",
        "Harry Potter",
        "PowerPuff Girls",
        "David Bowie",
        "Conan The Barbarian",
        "Spongebob Squarepants",
        "Game of Thrones",
        "The Dark Crystal",
        "Oldschool Runescape",
        "Star Wars",
        "Fantast-T-Shirt",
        "Ganja",
        "Jimmy Neutron",
        "The Hunger Games",
        "Labyrinth",
        "Crystal Meth",
        "Monty Python and the Holy Grail",
        "Pan's Labyrinth",
        "Pirates of the Caribbean",
        "Spirited Away",
        "Wizard of Oz"
    ];

    const container = document.getElementById("categoriesList");

    // Sorteer alfabetisch
    categories.sort((a, b) => a.localeCompare(b));

    container.innerHTML = categories.map(cat => `
        <label class="category-item">
            <input 
                type="checkbox" 
                name="category" 
                value="${cat.toLowerCase()}"
            >
            ${cat}
        </label>
    `).join("");

    // Apply Filters
    document.getElementById("categoriesForm")
        .addEventListener("submit", function (e) {

            e.preventDefault();

            const selected = [...document.querySelectorAll('input[name="category"]:checked')]
                .map(cb => cb.value.toLowerCase());

            if (selected.length === 0) return;

            // OR-filter (zoals je search)
            window.location.href =
                `/?tags=${encodeURIComponent(selected.join(","))}`;
        });
});