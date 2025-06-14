# 🚀 YouTube Video Summarizer 🚀

### Binge-watch less, learn more!

Tired of 20-minute videos that could have been a tweet? This extension is your new best friend. With a single click, it uses a powerful AI to instantly distill any YouTube video into a set of key, easy-to-read points.

## What's Inside? ✨

* **Instant Knowledge, Zero Waffle:** Get the good stuff from any video without the fluff.
* **Sleek & Minimalist UI:** Looks so good, you'll want to show it off.
* **AI-Powered Brains:** We've hooked this up to the Google Gemini API, so you're getting top-tier, context-aware summaries.
* **Copy & Go:** A dedicated button to copy the summary so you can paste it into your notes, a tweet, or a message to your friends.
* **Rock-Solid Build:** A stable client-server model means this thing just works.

## The Magic Behind the Curtain 🧙‍♂️

This project isn't just one thing; it's a dynamic duo working in perfect harmony:

1.  **The Friendly Face (Chrome Extension):** This is the part you see. Built with HTML, CSS, and JavaScript, its job is simple: when you press the button, it taps the backend on the shoulder and says, "Hey, this video right here, please!"

2.  **The Mastermind (Python Server):** This is where the real magic happens. Running silently on your machine, this Flask server:
    * Catches the request from the extension.
    * Politely asks YouTube for the video's full transcript.
    * Sends the transcript to its brainy friend, the **Google Gemini API**, for summarization.
    * Serves the perfect, clean summary back to the frontend on a silver platter.

---

## Your Mission, Should You Choose to Accept It... (Setup Guide)

Ready to get this running? Let's do it. You'll need to set up the backend server and the frontend extension.

### Tools You'll Need

* Python 3.8+
* Google Chrome (or a browser that likes Chrome extensions)
* A **Google API Key** with the **Gemini API** enabled. Grab one from the [Google AI Studio](https://ai.google.dev/).

### Step 1: Get the Code

Clone this repository to your machine and step inside.

```bash
git clone [https://github.com/your-username/youtube-summarizer.git](https://github.com/your-username/youtube-summarizer.git)
cd youtube-summarizer
```

### Step 2: Awaken the Backend 🐍

The server is the heart of the operation. Let's get it beating.

1.  **Enter the backend lair:**
    ```bash
    cd backend
    ```

2.  **Whip up a virtual environment:** It's like a VIP lounge for our Python packages.
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

3.  **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *(If you don't have a `requirements.txt`, just run: `pip install Flask Flask-Cors google-generativeai youtube-transcript-api`)*

4.  **Tell it the secret password (your API Key):** The server needs your API key to talk to Google. Set it as an environment variable **in the same terminal you're using**.
    * **On macOS/Linux:**
        ```bash
        export GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```
    * **On Windows (Command Prompt):**
        ```bash
        set GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```

5.  **Launch!**
    ```bash
    flask --app backend run
    ```
    You should see text confirming the server is alive and listening on `http://127.0.0.1:5000`. **Keep this terminal open!**

### Step 3: Unleash the Frontend 🤖

Almost there! Let's get the extension into Chrome.

1.  Open Chrome and go to `chrome://extensions`.
2.  Find the **"Developer mode"** switch in the top-right and flick it on.
3.  Click the **"Load unpacked"** button.
4.  Navigate to this project's folder and select the **`frontend`** directory.
5.  The YouTube Summarizer will pop up in your extensions list. Pin it to your toolbar—it's earned it!

## Let the Fun Begin! (Usage)

1.  Check that your Python server is still running in its terminal.
2.  Go to a YouTube video.
3.  Click the summarizer icon.
4.  Hit that glorious **"Generate Summary"** button.
5.  Watch as the summary appears, then copy it and share your newfound knowledge with the world!

## The Tech Stack 🥞

* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** Python, Flask
* **APIs & Libraries:** Google Gemini API, `youtube-transcript-api`
* **Tools:** Git & GitHub
