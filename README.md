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

## 🍪 Bypassing "Bot" & Age Restrictions

If you see "Sign in to confirm you're not a bot" or "Age Verification Required," follow these steps:

### 1. Extract Cookies from Browser
1. Install a browser extension like **"EditThisCookie"** or **"Get Cookies.txt"**.
2. Log in to your YouTube account.
3. Open the extension and copy the cookies for `youtube.com`. 
   - **Tip**: Copy the whole JSON array if using "Get Cookies.txt". The backend handles both JSON and raw strings.

### 2. Generate a PoToken (Critical for 2025)
YouTube now requires a "Proof of Origin" token for serverless requests.
1. You can often see this token in your browser's Network tab (look for `po=`) while playing a video, or use a tool like `yt-dlp` to extract it.
2. The token is a short alphanumeric string.

### 3. Set for Local Development
1. Create a `.env` file in the `music-player-backend` folder.
2. Add your cookies and token:
   ```env
   YOUTUBE_COOKIE="your_cookies_here"
   YOUTUBE_PO_TOKEN="your_potoken_here"
   ```
3. Restart the server with `node server.js`.

### 4. Set for Vercel Production
1. In the backend folder, run:
   ```bash
   npx vercel env add YOUTUBE_COOKIE
   npx vercel env add YOUTUBE_PO_TOKEN
   ```
2. Paste the values when prompted.
3. Redeploy: `npx vercel deploy --prod`.

---

## ☁️ How to Deploy to Vercel

1. **Log in to Vercel**: `npx vercel login`
2. **Deploy**: `npx vercel deploy --prod`

---

## 📖 API Documentation

### Convert YouTube URL to MP3
**Endpoint**: `POST /api/convert`

**Request Body**: `{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }`

**Successful Response**:
```json
{
  "success": true,
  "data": {
    "title": "Song Title",
    "audioUrl": "https://...",
    "duration": 240
  }
}
```
