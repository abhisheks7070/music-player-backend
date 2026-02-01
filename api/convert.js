const ytdl = require('@distube/ytdl-core');

// Helper to create a ytdl agent with cookies
const getAgent = () => {
  const cookieString = process.env.YOUTUBE_COOKIE;
  if (!cookieString) return null;

  try {
    // Try to parse as JSON first (modern format)
    if (cookieString.trim().startsWith('[') || cookieString.trim().startsWith('{')) {
      const cookies = JSON.parse(cookieString);
      return ytdl.createAgent(Array.isArray(cookies) ? cookies : [cookies]);
    }
  } catch (e) {
    console.warn('YOUTUBE_COOKIE is not valid JSON, attempting to use as legacy cookie string');
  }

  // Fallback: If it's a raw string, we try to create an agent with it
  // Note: createAgent usually expects an array of objects, but some versions 
  // might handle strings or we may need to manually parse them.
  try {
    // Simple parser for "name=value; name2=value2"
    const cookieArray = cookieString.split(';').map(pair => {
      const [name, ...value] = pair.split('=');
      if (name && value) {
        return { name: name.trim(), value: value.join('=').trim(), domain: '.youtube.com' };
      }
      return null;
    }).filter(Boolean);

    return ytdl.createAgent(cookieArray);
  } catch (e) {
    console.error('Failed to create agent from cookie string:', e);
    return null;
  }
};

/**
 * YouTube to Audio Conversion API
 * 
 * Endpoints:
 * - GET /api/convert?url=<youtube-url>  - Get video info and audio URL
 * - POST /api/convert { url: <youtube-url> } - Same as GET but via POST
 */

// Helper to extract video ID from various YouTube URL formats
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Format duration from seconds to MM:SS
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Main handler
module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Get URL from query params (GET) or body (POST)
    let videoUrl;
    if (req.method === 'GET') {
      videoUrl = req.query.url;
    } else if (req.method === 'POST') {
      videoUrl = req.body?.url;
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Use GET or POST.'
      });
    }

    // Validate URL
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: url'
      });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL format'
      });
    }

    // Validate with ytdl
    const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
    if (!ytdl.validateURL(fullUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube video URL'
      });
    }

    // Get video info with a modern agent and a realistic User-Agent
    const agent = getAgent();
    const options = {
      agent: agent || undefined,
      requestOptions: {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'accept-language': 'en-US,en;q=0.9',
        },
      },
    };

    const info = await ytdl.getInfo(fullUrl, options);
    const videoDetails = info.videoDetails;

    // Get audio-only formats, sorted by quality
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    if (audioFormats.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No audio formats available for this video'
      });
    }

    // Sort by bitrate (highest first) and get the best one
    audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
    const bestAudio = audioFormats[0];

    // Get thumbnail (prefer high quality)
    const thumbnails = videoDetails.thumbnails || [];
    const thumbnail = thumbnails[thumbnails.length - 1]?.url ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Return video info and audio URL
    return res.status(200).json({
      success: true,
      data: {
        videoId: videoId,
        title: videoDetails.title,
        author: videoDetails.author?.name || 'Unknown Artist',
        thumbnail: thumbnail,
        duration: parseInt(videoDetails.lengthSeconds) || 0,
        durationFormatted: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
        audioUrl: bestAudio.url,
        audioFormat: {
          mimeType: bestAudio.mimeType,
          bitrate: bestAudio.audioBitrate,
          contentLength: bestAudio.contentLength
        }
      }
    });

  } catch (error) {
    console.error('Conversion error:', error);

    // Handle specific ytdl errors
    if (error.message?.includes('Video unavailable')) {
      return res.status(404).json({
        success: false,
        error: 'Video is unavailable or private'
      });
    }

    if (error.message?.includes('Sign in to confirm')) {
      return res.status(403).json({
        success: false,
        error: 'This video requires age verification and cannot be processed'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to process video. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
