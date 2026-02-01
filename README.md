# ⚡ YouTube to MP3 Backend (Serverless)

This is the backend for the Music Player app. It uses `@distube/ytdl-core` to extract high-quality audio streams from YouTube links and serves them through a serverless API.

---

## 🛠 Prerequisites

Before starting, ensure you have:
- **Node.js** (v18 or higher) installed on your computer.
- A **Vercel** account (for free hosting).

---

## 🚀 How to Run Locally

If you want to test the API on your own computer:

1. **Navigate to the folder**:
   ```bash
   cd music-player-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local server**:
   ```bash
   node server.js
   ```
   The API will be available at `http://localhost:3000/api/convert`.

---

## ☁️ How to Deploy to Vercel

To host this backend for free so your mobile app can access it from anywhere:

1. **Log in to Vercel**:
   ```bash
   npx vercel login
   ```
   (Follow the instructions in your browser to authorize).

2. **Deploy to Production**:
   ```bash
   npx vercel deploy --prod
   ```

3. **Get your URL**:
   Vercel will provide a link like `https://music-player-backend-xxx.vercel.app`. Your API endpoint will be that URL + `/api/convert`.

---

## 📖 API Documentation

### Convert YouTube URL to MP3
**Endpoint**: `POST /api/convert`

**Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Successful Response**:
```json
{
  "success": true,
  "data": {
    "title": "Song Title",
    "author": "Artist Name",
    "thumbnail": "https://...",
    "audioUrl": "https://...",
    "duration": 240
  }
}
```

---

## ⚠️ Known Issues (Age Verification)
YouTube sometimes blocks "serverless" IP addresses (like Vercel). If you see an "age verification" error:
1. Run the backend **locally** using `node server.js`.
2. Update the mobile app's `API_BASE_URL` in `src/utils/constants.ts` to your computer's IP address.
