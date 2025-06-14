// Listen for a message from the popup script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTranscript") {
        // Find the active tab to inject scripts.
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab || !activeTab.url || !activeTab.url.includes("youtube.com/watch")) {
                sendResponse({ error: "Not a YouTube video page." });
                return;
            }

            // Step 1: Inject a script to get the transcript URL.
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: getTranscriptUrlFromPage,
            }, (injectionResults) => {
                if (chrome.runtime.lastError || !injectionResults || !injectionResults[0].result) {
                    sendResponse({ error: "Could not find transcript URL." });
                    return;
                }
                
                const transcriptUrl = injectionResults[0].result;
                if (transcriptUrl.startsWith("Error:")) {
                    sendResponse({ error: transcriptUrl });
                    return;
                }

                // Step 2: Inject another script to fetch and parse the transcript.
                // This runs in the content script context, bypassing potential CORS issues.
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    function: fetchAndParseTranscript,
                    args: [transcriptUrl] // Pass the URL as an argument
                }, (parsingResults) => {
                    if (chrome.runtime.lastError || !parsingResults || !parsingResults[0].result) {
                        sendResponse({ error: "Failed to fetch and parse transcript from the page." });
                        return;
                    }
                    
                    const result = parsingResults[0].result;
                    if (result.error) {
                        sendResponse({ error: result.error });
                    } else {
                        sendResponse({ transcript: result.transcript });
                    }
                });
            });
        });

        return true; // Keep the message channel open for the asynchronous response.
    }
});

// This function is injected into the YouTube page to find the transcript URL.
function getTranscriptUrlFromPage() {
    try {
        const scripts = document.querySelectorAll('script');
        let playerResponse;
        for (const script of scripts) {
            if (script.textContent.includes('ytInitialPlayerResponse')) {
                const text = script.textContent;
                const startIndex = text.indexOf('{');
                const endIndex = text.lastIndexOf('}');
                playerResponse = JSON.parse(text.substring(startIndex, endIndex + 1));
                break;
            }
        }

        if (!playerResponse) return "Error: Transcript data not found on page.";

        const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!captionTracks || captionTracks.length === 0) {
            return "Error: No captions available for this video.";
        }
        
        // Prefer manually created English captions over auto-generated ones.
        const englishTrack = captionTracks.find(track => track.languageCode === 'en' && !track.vssId.startsWith('.'));
        return englishTrack ? englishTrack.baseUrl : captionTracks[0].baseUrl;

    } catch (e) {
        return `Error: ${e.message}`;
    }
}

// This function is injected into the page to fetch and parse the transcript.
async function fetchAndParseTranscript(transcriptUrl) {
    try {
        const response = await fetch(transcriptUrl);
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const responseText = await response.text();
        
        // Try parsing as JSON first
        try {
            const jsonData = JSON.parse(responseText);
            if (jsonData && jsonData.events) {
                const transcriptParts = jsonData.events
                    .filter(event => event.segs)
                    .map(event => event.segs.map(seg => seg.utf8).join(''))
                    .join(' ');
                
                const fullTranscript = transcriptParts.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                
                if (fullTranscript.length > 0) {
                    return { transcript: fullTranscript };
                }
            }
        } catch (jsonError) {
            // Not JSON, continue to try XML
        }

        // Try parsing as XML second
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(responseText, "text/xml");
            const textNodes = xmlDoc.getElementsByTagName('text');
            
            if (textNodes.length > 0) {
                const transcriptParts = [];
                for (let i = 0; i < textNodes.length; i++) {
                    if (textNodes[i].textContent) {
                        transcriptParts.push(textNodes[i].textContent);
                    }
                }
                
                const fullTranscript = transcriptParts.join(' ')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, "&")
                    .replace(/&quot;/g, '"')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                    
                if (fullTranscript.length > 0) {
                    return { transcript: fullTranscript };
                }
            }
        } catch (xmlError) {
            // Not valid XML, continue to final fallback
        }

        // Fallback: clean the raw text as a last resort
        const cleanedText = responseText
            .replace(/<[^>]+>/g, ' ') // Strip all tags
            .replace(/&#39;/g, "'")   // Decode common entities
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')     // Collapse whitespace
            .trim();

        if (cleanedText.length > 0) {
            return { transcript: cleanedText };
        }

        // If all attempts fail, return an error.
        return { error: "Could not parse transcript. The format is not recognized." };

    } catch (error) {
        return { error: `Failed to process transcript: ${error.message}` };
    }
}
