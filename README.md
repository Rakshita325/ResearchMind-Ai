# ResearchMind AI

A beginner-friendly full-stack web application that allows users to upload a research paper PDF and uses the Google Gemini API to:
1. Extract text from the PDF.
2. Generate a simple summary (Objective, Methodology, Key findings, Conclusion).
3. Explain the paper in beginner-friendly language.
4. Allow users to ask questions about the uploaded paper.

## Prerequisites

- Python 3.8+
- Node.js (for npm)
- A Google Gemini API Key

## Setup Instructions

### 1. Backend Setup (Flask)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set your Gemini API Key as an environment variable:
   - On Windows (Command Prompt): `set GEMINI_API_KEY=your_api_key_here`
   - On Windows (PowerShell): `$env:GEMINI_API_KEY="your_api_key_here"`
   - On macOS/Linux: `export GEMINI_API_KEY=your_api_key_here`

5. Start the backend server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup (React)

1. Open a **new** terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the required Node packages:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000` and should automatically open in your browser.

## How to Use

1. Ensure both the backend and frontend servers are running.
2. Open `http://localhost:3000` in your browser.
3. Click "Choose PDF File" and select a research paper.
4. Click "Analyze Paper". The app will extract the text and use Gemini to generate an executive summary and a simplified explanation.
5. Once the analysis is complete, you can use the chat interface at the bottom to ask specific questions about the paper content.

## Architecture & Tech Stack
- **Frontend**: React (Minimal setup, Vanilla CSS for beautiful UI)
- **Backend**: Python, Flask, Flask-CORS
- **PDF Processing**: PyPDF2
- **AI Model**: Google Gemini (`gemini-2.5-flash`) via `google-generativeai`
