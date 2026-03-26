# 🧠 Smart Brain — Personal Knowledge Graph

> Save anything from the internet. AI auto-tags, clusters, and resurfaces it for you.

![Smart Brain](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20ImageKit-7c3aed?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---|---|
| 💾 **Save anything** | Articles, YouTube videos, tweets, images, PDFs, notes |
| 🏷️ **Auto-tagging** | NLP keyword extraction — no setup needed |
| 🕸️ **Knowledge Graph** | D3.js force-directed visualization of all your saves |
| 🔍 **Semantic Search** | Full-text search across titles, content, and tags |
| 📁 **Collections** | Organise saves into color-coded collections |
| 🕰️ **Memory Resurfacing** | "You saved this 2 months ago" — resurface forgotten gems |
| 📎 **File Uploads** | Images & PDFs via Multer → ImageKit CDN |
| 🌐 **Browser Extension** | One-click save from any webpage (Chrome/Edge) |

---

## 🗂️ Folder Structure

```
smart-brain-app/
├── backend/                 # Node.js + Express API
│   ├── config/db.js         # MongoDB connection
│   ├── controllers/         # Request handlers
│   ├── models/              # Mongoose schemas (Item, Collection)
│   ├── routes/              # Express routers
│   ├── services/            # uploadService, autoTagService, scrapeService
│   ├── server.js            # Entry point
│   └── .env                 # Environment variables ← EDIT THIS
│
├── frontend/                # React + Vite app
│   └── src/
│       ├── components/      # Navbar, ItemCard, GraphView, AddItemModal
│       ├── pages/           # Dashboard, Search, Collections, GraphPage
│       └── services/api.js  # Axios API client
│
└── extension/               # Chrome/Edge browser extension
    ├── manifest.json
    ├── popup.html / popup.js
    ├── content.js
    └── background.js
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (`mongod`) OR use MongoDB Atlas
- **ImageKit** account (free at [imagekit.io](https://imagekit.io)) — needed only for file uploads

### 2. Clone & Install

```bash
cd smart-brain-app
npm install          # installs root concurrently
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-brain
CLIENT_URL=http://localhost:5173

# Get from imagekit.io → Developer Options → API Keys
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### 4. Run

```bash
# From root — starts both backend AND frontend
npm run dev

# Or run separately:
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

---

## 🌐 Browser Extension

1. Open **Chrome** → `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked** → select the `extension/` folder
4. Pin the 🧠 Smart Brain icon to your toolbar
5. Navigate to any page → click the icon → **Save to Brain**
6. Keyboard shortcut: **Alt + S**

> ⚠️ Make sure the backend is running on `localhost:5000` for the extension to work.

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/items` | List items (filter: type, tag, search, collectionId) |
| `POST` | `/api/items` | Save new item (auto-scrape + auto-tag from URL) |
| `PUT` | `/api/items/:id` | Update item |
| `DELETE` | `/api/items/:id` | Delete item |
| `POST` | `/api/items/upload` | Upload file → ImageKit |
| `GET` | `/api/items/stats` | Dashboard stats |
| `GET` | `/api/items/resurface` | Memory resurfacing items |
| `GET` | `/api/items/graph` | D3.js graph nodes + links |
| `GET` | `/api/items/:id/related` | Related items (Jaccard similarity) |
| `POST` | `/api/items/:id/highlight` | Add text highlight |
| `GET` | `/api/collections` | List collections with item counts |
| `POST` | `/api/collections` | Create collection |
| `DELETE` | `/api/collections/:id` | Delete collection (unlinks items) |

---

## 🏗️ Architecture

```
Browser Extension / React App
           ↓
      Node.js API (Express)
           ↓
   ┌───────┴────────┐
Multer           Scraper
(file buffer)    (cheerio)
   ↓                ↓
ImageKit CDN    Auto-tagger (NLP)
   ↓                ↓
        MongoDB
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Graph | D3.js v7 (force-directed) |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| File Upload | Multer → ImageKit |
| URL Scraping | Axios + Cheerio |
| Auto-tagging | natural.js (TF, stemming) |
| Extension | Chrome MV3 |
