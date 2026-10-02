let currentQuote = null;


// Get random quote
async function getQuote() {

    try {

        const response = await fetch("/api/quote");

        const data = await response.json();

        currentQuote = data;

        document.getElementById("quote").textContent =
            `"${data.quote}"`;

        document.getElementById("author").textContent =
            `— ${data.author}`;

        document.getElementById("topic").textContent =
            `Topic: ${data.topic}`;

        document.getElementById("source").textContent =
            `Source: ${data.source}`;

    } catch (error) {

        console.error(error);

        document.getElementById("quote").textContent =
            "Could not load quote.";
    }
}


// Add favorite
async function addFavorite() {

    if (!currentQuote) {
        alert("Please load a quote first.");
        return;
    }

    try {

        const response = await fetch("/api/favorites", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                quote: currentQuote.quote,
                author: currentQuote.author,
                topic: currentQuote.topic
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error);
            return;
        }

        alert("Quote added to favorites!");

        loadFavorites();

    } catch (error) {

        console.error(error);

        alert("Could not save favorite.");
    }
}


// Copy quote
async function copyQuote() {

    if (!currentQuote) {
        return;
    }

    const text =
        `"${currentQuote.quote}" — ${currentQuote.author}`;

    try {

        await navigator.clipboard.writeText(text);

        alert("Quote copied!");

    } catch (error) {

        console.error(error);

        alert("Could not copy quote.");
    }
}


// Load favorites
async function loadFavorites() {

    try {

        const response =
            await fetch("/api/favorites");

        const favorites =
            await response.json();

        const favoritesList =
            document.getElementById("favoritesList");

        if (favorites.length === 0) {

            favoritesList.innerHTML =
                "<p>No favorites yet.</p>";

            return;
        }

        favoritesList.innerHTML = "";

        favorites.forEach((favorite) => {

            const card =
                document.createElement("div");

            card.className = "favorite-card";

            card.innerHTML = `
                <p class="favorite-quote">
                    "${favorite.quote}"
                </p>

                <p class="favorite-author">
                    — ${favorite.author}
                </p>

                <p>
                    Topic: ${favorite.topic || "Random"}
                </p>

                <p>
                    Saved: ${favorite.created_at}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteFavorite(${favorite.id})">
                    🗑️ Delete
                </button>
            `;

            favoritesList.appendChild(card);
        });

    } catch (error) {

        console.error(error);
    }
}


// Delete favorite
async function deleteFavorite(id) {

    try {

        const response =
            await fetch(`/api/favorites/${id}`, {
                method: "DELETE"
            });

        const data =
            await response.json();

        if (!response.ok) {

            alert(data.error);

            return;
        }

        loadFavorites();

    } catch (error) {

        console.error(error);
    }
}


// Buttons
document
    .getElementById("newQuoteBtn")
    .addEventListener("click", getQuote);

document
    .getElementById("favoriteBtn")
    .addEventListener("click", addFavorite);

document
    .getElementById("copyBtn")
    .addEventListener("click", copyQuote);


// Initial loading
getQuote();
loadFavorites();