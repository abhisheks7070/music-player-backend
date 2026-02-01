/**
 * This script helps you generate the PoToken and VisitorData needed to bypass 
 * YouTube's "Sign in to confirm you're not a bot" error on Vercel.
 * 
 * Run it with: node generate-token.js
 */

async function generate() {
    console.log('--- YouTube PoToken Generator ---');
    console.log('1. Open Chrome/Firefox and go to https://www.youtube.com');
    console.log('2. Open Inspect Element -> Network Tab');
    console.log('3. Refresh the page and play ANY video.');
    console.log('4. Search for "player" in the Filter.');
    console.log('5. Look for a request that has "po=" in its URL params.');
    console.log('6. Copy the value of "po=" (The PoToken) and "visitorData="');
    console.log('\n--- Alternative (Automated Way) ---');
    console.log('Since manual extraction is hard, I recommend using this tool:');
    console.log('https://tacit-possum.vercel.app/ (A community PoToken generator)');
    console.log('\nOnce you have them, run these commands:');
    console.log('npx vercel env add YOUTUBE_PO_TOKEN');
    console.log('npx vercel env add YOUTUBE_VISITOR_DATA');
    console.log('npx vercel deploy --prod');
}

generate();
