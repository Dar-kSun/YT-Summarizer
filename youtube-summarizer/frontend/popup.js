/* 4. Save this file as popup.js */
// DOM elements
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryContainer = document.getElementById('summaryContainer');
const summaryDiv = document.getElementById('summary');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');

const BACKEND_URL = 'http://127.0.0.1:5000/api/summarize';

/**
 * Extracts the YouTube video ID from a URL.
 * @param {string} url - The full YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function getVideoIdFromUrl(url) {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
    } catch (e) {
        console.error("Invalid URL:", e);
        return null;
    }
    return null;
}

/**
 * Fetches the summary from the Python backend.
 * @param {string} videoId - The ID of the YouTube video.
 * @returns {string|null} The summary text or null on failure.
 */
async function getSummaryFromBackend(videoId) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ video_id: videoId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        let summaryText = data.summary;
        // Replace markdown for better HTML rendering
        summaryText = summaryText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
        summaryText = summaryText.replace(/\n\s*\*/g, '<br> &bull;'); 
        return summaryText;

    } catch (error) {
        console.error('Error fetching summary from backend:', error);
        showError(error.message || "Failed to connect to the backend server. Is it running?");
        return null;
    }
}


// --- UI Helper Functions ---
function showLoading(show) {
    loadingDiv.classList.toggle('hidden', !show);
    summarizeBtn.disabled = show;
    summarizeBtn.classList.toggle('opacity-50', show);
    summarizeBtn.classList.toggle('cursor-not-allowed', show);
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    summaryContainer.classList.add('hidden');
}

function showSummary(summary) {
    summaryDiv.innerHTML = summary;
    summaryContainer.classList.remove('hidden');
    errorDiv.classList.add('hidden');
}

function resetUI() {
    errorDiv.classList.add('hidden');
    summaryContainer.classList.add('hidden');
    summaryDiv.innerHTML = '';
    showLoading(false);
}


/**
 * Main function triggered by the button click.
 */
summarizeBtn.addEventListener('click', async () => {
    resetUI();
    showLoading(true);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const videoId = getVideoIdFromUrl(tab.url);

    if (!videoId) {
        showError("Not a valid YouTube video page.");
        showLoading(false);
        return;
    }
    
    const summary = await getSummaryFromBackend(videoId);
    if (summary) {
        showSummary(summary);
    }
    
    showLoading(false);
});