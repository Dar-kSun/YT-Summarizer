# Save this file as backend.py
#
# Required libraries: Flask, Flask-Cors, google-generativeai, youtube-transcript-api
# Install them using pip:
# pip install Flask Flask-Cors google-generativeai youtube-transcript-api

import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi

# --- Configuration ---
# 1. Set up your Google API Key as an environment variable.
#    In your terminal, run: export GOOGLE_API_KEY="YOUR_API_KEY"
# 2. To run the server, use the command: flask --app backend run
#    (or `python -m flask --app backend run`)
genai.configure(api_key="YOUR_API_KEY")

app = Flask(__name__)
# Allow requests from the Chrome extension's ID
CORS(app) 

# --- Gemini Model Configuration ---
generation_config = {
    "temperature": 0.4,
    "top_p": 1,
    "top_k": 32,
    "max_output_tokens": 2048,
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config
)

def get_transcript(video_id: str):
    """Fetches the transcript for a given YouTube video ID."""
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        # Combine the transcript segments into a single string
        transcript = " ".join([d['text'] for d in transcript_list])
        return transcript, None
    except Exception as e:
        print(f"Error fetching transcript: {e}")
        return None, "Transcript not available for this video."

def summarize_with_gemini(transcript: str):
    """Generates a summary using the Gemini API."""
    if not transcript:
        return None, "Cannot summarize an empty transcript."

    prompt = (
        "Please provide a concise summary of the following YouTube video transcript. "
        "Focus on the main points and key takeaways. Format the output with a title in bold, "
        "followed by bullet points for the summary.\n\n"
        f'Transcript:\n"""{transcript}"""'
    )
    
    try:
        response = model.generate_content(prompt)
        return response.text, None
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        return None, "Failed to generate summary."


@app.route('/api/summarize', methods=['POST'])
def summarize_video():
    """API endpoint to get a video summary."""
    data = request.get_json()
    video_id = data.get('video_id')

    if not video_id:
        return jsonify({"error": "Video ID is required"}), 400

    # 1. Get Transcript
    transcript, error = get_transcript(video_id)
    if error:
        return jsonify({"error": error}), 500

    # 2. Get Summary
    summary, error = summarize_with_gemini(transcript)
    if error:
        return jsonify({"error": error}), 500

    return jsonify({"summary": summary})

if __name__ == '__main__':
    # Running in debug mode is not recommended for production
    app.run(debug=True, port=5000)
