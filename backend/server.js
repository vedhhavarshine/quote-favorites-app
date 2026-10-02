const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();

// Use hosting platform's port when deployed.
// Use 3000 when running locally.
const PORT = process.env.PORT || 3000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// DATABASE SETUP
// ==============================

const dbPath = path.join(__dirname, "quotes.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote TEXT NOT NULL,
        author TEXT NOT NULL,
        topic TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Table creation error:", err.message);
    } else {
        console.log("Favorites table ready.");
    }
});

// ==============================
// FALLBACK DATASET
// ==============================

const fallbackPath = path.join(
    __dirname,
    "data",
    "quote_history_seed.json"
);

let fallbackQuotes = [];

try {
    fallbackQuotes = JSON.parse(
        fs.readFileSync(fallbackPath, "utf8")
    );

    console.log(
        `Loaded ${fallbackQuotes.length} fallback quotes.`
    );
} catch (error) {
    console.error(
        "Could not load fallback dataset:",
        error.message
    );
}

// ==============================
// GET RANDOM QUOTE
// ==============================

app.get("/api/quote", async (req, res) => {

    try {

        const response = await fetch(
            "https://dummyjson.com/quotes/random"
        );

        if (!response.ok) {
            throw new Error("Quote API failed");
        }

        const data = await response.json();

        res.json({
            quote: data.quote,
            author: data.author,
            topic: "Random",
            source: "api"
        });

    } catch (error) {

        console.log(
            "API unavailable. Using fallback dataset."
        );

        if (fallbackQuotes.length === 0) {

            return res.status(500).json({
                error: "No quote source available."
            });
        }

        const randomIndex = Math.floor(
            Math.random() * fallbackQuotes.length
        );

        const fallbackQuote =
            fallbackQuotes[randomIndex];

        res.json({
            quote: fallbackQuote.text,
            author: fallbackQuote.author,
            topic: fallbackQuote.topic,
            source: "fallback"
        });
    }
});

// ==============================
// GET FAVORITES
// ==============================

app.get("/api/favorites", (req, res) => {

    db.all(
        `SELECT * FROM favorites ORDER BY created_at DESC`,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: "Could not retrieve favorites."
                });
            }

            res.json(rows);
        }
    );
});

// ==============================
// ADD FAVORITE
// ==============================

app.post("/api/favorites", (req, res) => {

    const { quote, author, topic } = req.body;

    if (!quote || !author) {

        return res.status(400).json({
            error: "Quote and author are required."
        });
    }

    db.get(
        `SELECT * FROM favorites
         WHERE quote = ? AND author = ?`,
        [quote, author],
        (err, row) => {

            if (err) {

                return res.status(500).json({
                    error: "Database error."
                });
            }

            if (row) {

                return res.status(409).json({
                    error: "Quote is already in favorites."
                });
            }

            db.run(
                `INSERT INTO favorites
                 (quote, author, topic)
                 VALUES (?, ?, ?)`,
                [
                    quote,
                    author,
                    topic || "Random"
                ],
                function (err) {

                    if (err) {

                        return res.status(500).json({
                            error: "Could not save favorite."
                        });
                    }

                    res.status(201).json({
                        message: "Quote added to favorites.",
                        id: this.lastID
                    });
                }
            );
        }
    );
});

// ==============================
// DELETE FAVORITE
// ==============================

app.delete("/api/favorites/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        `DELETE FROM favorites WHERE id = ?`,
        [id],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: "Could not delete favorite."
                });
            }

            if (this.changes === 0) {

                return res.status(404).json({
                    error: "Favorite not found."
                });
            }

            res.json({
                message: "Favorite deleted."
            });
        }
    );
});

// ==============================
// SERVE FRONTEND
// ==============================

app.use(
    express.static(
        path.join(__dirname, "..", "frontend")
    )
);

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );
});