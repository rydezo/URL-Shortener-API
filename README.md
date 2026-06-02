# URL Shortener API

A REST API that shortens URLs, tracks clicks, and serves redirects. Built with Node.js, Express, SQLite, and Redis.

**Live API:** https://url-shortener-api-production-edd7.up.railway.app

---

## Tech Stack

- **Node.js + Express** — REST API
- **SQLite (better-sqlite3)** — persistent storage
- **Redis** — caching layer for hot redirects
- **Railway** — deployment and hosting

---

## Endpoints

### POST /shorten
Accepts a URL and returns a shortened version.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "short_code": "v2zmX8",
  "short_url": "https://url-shortener-api-production-edd7.up.railway.app/v2zmX8",
  "original_url": "https://example.com"
}
```

### GET /:code
Redirects to the original URL. Returns `301`.

### GET /:code/stats
Returns click analytics for a short URL.

**Response:**
```json
{
  "short_code": "v2zmX8",
  "short_url": "https://url-shortener-api-production-edd7.up.railway.app/v2zmX8",
  "original_url": "https://example.com",
  "created_at": "2026-06-02 20:30:13",
  "total_clicks": 4,
  "last_clicked": "2026-06-02 20:35:01"
}
```

---

## Caching Strategy

Redirects are cached in Redis with a 1 hour TTL. On the first visit, the original URL is fetched from SQLite and stored in Redis. Subsequent visits are served directly from cache without touching the database. Cache keys are invalidated immediately on delete to keep the database and cache consistent.

---

## Running Locally

**Prerequisites:** Node.js v18+, Redis

```bash
git clone https://github.com/YOUR_USERNAME/url-shortener-api
cd url-shortener-api
npm install
```

Create a `.env` file:

```
PORT=3000
BASE_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

Start Redis, then:

```bash
npm run dev
```

---

## Project Structure

```
src/
├── db/
│   ├── database.js      # SQLite connection and schema migrations
│   └── cache.js         # Redis client
├── routes/
│   └── urls.js          # Route handlers
├── middleware/
│   └── validate.js      # URL validation
└── index.js             # Express app entry point
```

---

## License

MIT
