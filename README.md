# YouTube Video Summarizer

A Chrome extension and Python backend that leverages the Google Gemini API to generate summaries from YouTube video transcripts. This project demonstrates a decoupled client-server architecture, with a browser extension acting as the client and a local Flask server providing the core functionality.

## Features

* **On-Demand Summary Generation:** A simple browser action popup allows users to request a video summary with a single click.
* **Clean User Interface:** A modern and intuitive UI built with standard HTML5, CSS3, and JavaScript.
* **AI-Powered Summarization:** Utilizes Google's Gemini API for high-quality, context-aware text summarization.
* **Integrated Copy-to-Clipboard:** Easily copy the generated summary for use in other applications.
* **Decoupled Architecture:** A stable client-server model improves maintainability by separating frontend logic from backend processing.

## System Architecture

This project is composed of two primary components that communicate via a RESTful API:

1.  **Frontend (Chrome Extension):** The client-side interface built with HTML, CSS, and JavaScript. Its main responsibility is to capture the video ID from the active YouTube tab. When a user initiates a request, it sends a `POST` request with a JSON payload (`{ "video_id": "..." }`) to the backend's API endpoint.

2.  **Backend (Python Flask Server):** A local server that exposes a REST API endpoint (`/api/summarize`). Upon receiving a request, it performs the following tasks:
    * It uses the `youtube-transcript-api` library to fetch the full transcript for the provided video ID.
    * It constructs a detailed prompt containing the transcript and sends it to the **Google Gemini API** for processing.
    * It receives the generated summary from the Gemini API and returns it to the client in a JSON response.

---

## Local Setup and Installation

To run this project, you must configure and run both the backend server and the frontend extension.

### Prerequisites

* Python 3.8+
* Google Chrome (or another Chromium-based browser)
* A **Google API Key** with the **Generative Language API (Gemini)** enabled. This can be obtained from the [Google AI Studio](https://ai.google.dev/).

### Step 1: Clone the Repository

Clone this repository to your local machine using Git.

```bash
git clone [https://github.com/Dar-kSun/youtube-summarizer.git](https://github.com/Dar-kSun/youtube-summarizer.git)
cd youtube-summarizer
```

### Step 2: Backend Server Setup

The Flask server must be running for the extension to function.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment:**
    * **On macOS/Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    * **On Windows:**
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: If a `requirements.txt` file is not present, install manually: `pip install Flask Flask-Cors google-generativeai youtube-transcript-api`)*

4.  **Set the `GOOGLE_API_KEY` Environment Variable:** The server requires this variable to authenticate with the Google API. This must be set in the same terminal session where the server is launched.
    * **On macOS/Linux:**
        ```bash
        export GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```
    * **On Windows (Command Prompt):**
        ```bash
        set GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```

5.  **Run the Flask server:**
    ```bash
    flask --app backend run
    ```
    The server will start and listen for requests on `http://127.0.0.1:5000`. Keep this terminal window open.

### Step 3: Frontend Extension Setup

Load the client-side extension into your browser.

1.  Open Chrome and navigate to the extensions page: `chrome://extensions`.
2.  Enable **"Developer mode"** via the toggle in the top-right corner.
3.  Click the **"Load unpacked"** button.
4.  In the file dialog, select the project's **`frontend`** directory.
5.  The YouTube Video Summarizer extension will be installed. Pin it to your toolbar for easy access.

## Usage

1.  Ensure the Python backend server is running in your terminal.
2.  Navigate to a YouTube video page in your browser.
3.  Click the extension's icon in the Chrome toolbar.
4.  Click the **"Generate Summary"** button to initiate the API call.
5.  The summary will be displayed in the popup, where it can be copied.

## Technology Stack

* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** Python, Flask
* **APIs & Libraries:** Google Gemini API, `youtube-transcript-api`
* **Tools:** Git & GitHub
