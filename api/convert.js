/**
 * YouTube to Audio Conversion API using Piped
 * Uses Piped API (YouTube proxy) with automatic fallback
 */

// List of Piped API instances (ordered by reliability)
const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.yt',
  'https://pipedapi.in.projectsegfau.lt',
  'https://api-piped.mha.fi',
  'https://pipedapi.syncpundit.io',
];

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

// Fetch video info from a single Piped instance
async function fetchFromInstance(instance, videoId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await fetch(`${instance}/streams/${videoId}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MusicPlayerApp/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if we got valid data
    if (data.error) {
      throw new Error(data.error);
    }

    return { success: true, data, instance };
  } catch (error) {
    clearTimeout(timeout);
    return { success: false, error: error.message, instance };
  }
}

// Try multiple instances with fallback
async function getVideoInfo(videoId) {
  const errors = [];

  for (const instance of PIPED_INSTANCES) {
    console.log(`Trying Piped instance: ${instance}`);
    const result = await fetchFromInstance(instance, videoId);

    if (result.success) {
      console.log(`Success with instance: ${instance}`);
      return result;
    }

    errors.push({ instance, error: result.error });
    console.log(`Failed with ${instance}: ${result.error}`);
  }

  // All instances failed
  return {
    success: false,
    error: 'All Piped instances failed',
    details: errors,
  };
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
        error: 'Method not allowed. Use GET or POST.',
      });
    }

    // Validate URL
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: url',
      });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL format',
      });
    }

    // Get video info from Piped
    const result = await getVideoInfo(videoId);

    if (!result.success) {
      return res.status(503).json({
        success: false,
        error: 'Unable to fetch video info. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? result.details : undefined,
      });
    }

    const videoData = result.data;
    const usedInstance = result.instance;

    // Find best audio format from audioStreams
    const audioStreams = (videoData.audioStreams || [])
      .filter((s) => s.url) // Must have a URL
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    if (audioStreams.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No audio formats available for this video',
      });
    }

    const bestAudio = audioStreams[0];

    // Get thumbnail
    const thumbnail = videoData.thumbnailUrl ||
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Return video info and audio URL
    return res.status(200).json({
      success: true,
      data: {
        videoId: videoId,
        title: videoData.title,
        author: videoData.uploader || 'Unknown Artist',
        thumbnail: thumbnail,
        duration: videoData.duration || 0,
        durationFormatted: formatDuration(videoData.duration || 0),
        audioUrl: bestAudio.url,
        audioFormat: {
          mimeType: bestAudio.mimeType,
          bitrate: bestAudio.bitrate,
          quality: bestAudio.quality,
        },
        _meta: {
          source: 'piped',
          instance: usedInstance,
        },
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to process video. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
