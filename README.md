# Quote Favorites App

A full-stack web application that fetches random quotes from a public API and allows users to save their favorite quotes.

## Features

- Fetch random quotes from a public API
- Fallback quote dataset when the API is unavailable
- Save favorite quotes
- View favorite quote history
- Copy quotes to clipboard
- Delete favorite quotes
- Store favorites using SQLite

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- SQLite
- REST API

## Project Structure

```text
quote-favorites-app/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── data/
│   │   └── quote_history_seed.json
│   ├── package.json
│   └── server.js
│
└── README.md