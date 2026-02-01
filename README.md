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

## 🍪 Bypassing Age Restrictions

If you see "Age Verification Required," you need to provide your YouTube session cookies.

### 1. Extract Cookies from Browser
1. Install a browser extension like **"EditThisCookie"** or **"Get Cookies.txt"**.
2. Log in to your YouTube account.
3. Open the extension and copy the cookies for `youtube.com`.
4. The backend expects a **raw cookie string** (e.g., `VISITOR_INFO1_LIVE=xxx; SID=yyy; ...`).

### 2. Set for Local Development
1. Create a `.env` file in the `music-player-backend` folder.
2. Add your cookie string:
   ```env
   YOUTUBE_COOKIE="your_full_cookie_string_here"
   ```
3. Restart the server with `node server.js`.

### 3. Set for Vercel Production
1. In the backend folder, run:
   ```bash
   npx vercel env add YOUTUBE_COOKIE
   ```
2. Paste your cookie string when prompted.
3. Select `Production`, `Preview`, and `Development`.
4. Redeploy: `npx vercel deploy --prod`.

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

## 🍪 Bypassing Age Restrictions

If you see "Age Verification Required," you need to provide your YouTube session cookies.

### 1. Extract Cookies from Browser
1. Install a browser extension like **"EditThisCookie"** or **"Get Cookies.txt"**.
2. Log in to your YouTube account.
3. Open the extension and copy the cookies for `youtube.com`.
4. The backend expects a **raw cookie string** (e.g., `VISITOR_INFO1_LIVE=xxx; SID=yyy; ...`).

### 2. Set for Local Development
1. Create a `.env` file in the `music-player-backend` folder.
2. Add your cookie string:
   ```env
   YOUTUBE_COOKIE="your_full_cookie_string_here"
   ```
3. Restart the server with `node server.js`.

### 3. Set for Vercel Production
1. In the backend folder, run:
   ```bash
   npx vercel env add YOUTUBE_COOKIE
   ```
2. Paste your cookie string when prompted.
3. Select `Production`, `Preview`, and `Development`.
4. Redeploy: `npx vercel deploy --prod`.
