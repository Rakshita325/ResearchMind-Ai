import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import PyPDF2
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Simple in-memory storage for the uploaded paper text
# In a real app, this should be stored in a database or tied to a user session
app.config['PAPER_TEXT'] = ""

# Configure Gemini API
# The user must set the GEMINI_API_KEY environment variable before running
API_KEY = "AIzaSyCZpDM8E4sw-lANGKJVXeorsg7rtrtzH8M"
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY environment variable not set.")

def extract_text_from_pdf(pdf_file):
    """Extracts text from a PyPDF2 readable file object."""
    try:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

@app.route('/upload', methods=['POST'])
def upload_pdf():
    """Handles PDF upload, extracts text, and generates summary and simplification."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith('.pdf'):
        # Extract text from the uploaded file
        # We use io.BytesIO to read the file directly from memory
        pdf_bytes = io.BytesIO(file.read())
        extracted_text = extract_text_from_pdf(pdf_bytes)
        
        if not extracted_text:
            return jsonify({"error": "Could not extract text from the PDF"}), 500
            
        # Store text in memory for Q&A later
        app.config['PAPER_TEXT'] = extracted_text
        
        try:
            # Initialize the Gemini model
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Generate Summary
            summary_prompt = f"Summarize this research paper in simple language with:\n1. Objective\n2. Methodology\n3. Key findings\n4. Conclusion\n\nPaper Content:\n{extracted_text[:30000]}" # Limiting text to avoid token limits for simple setup
            summary_response = model.generate_content(summary_prompt)
            summary = summary_response.text
            
            # Generate Simplification
            simplify_prompt = f"Explain this research paper like teaching a beginner student.\n\nPaper Content:\n{extracted_text[:30000]}"
            simplify_response = model.generate_content(simplify_prompt)
            simplification = simplify_response.text
            
            return jsonify({
                "message": "File processed successfully",
                "summary": summary,
                "simplification": simplification
            }), 200
            
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return jsonify({"error": "Failed to generate AI response. Make sure GEMINI_API_KEY is valid."}), 500
            
    return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400

@app.route('/ask', methods=['POST'])
def ask_question():
    """Answers a user question based on the uploaded paper context."""
    data = request.json
    if not data or 'question' not in data:
        return jsonify({"error": "No question provided"}), 400
        
    question = data['question']
    paper_text = app.config.get('PAPER_TEXT', '')
    
    if not paper_text:
        return jsonify({"error": "No paper uploaded yet. Please upload a PDF first."}), 400
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        qa_prompt = f"Answer the user question only using the uploaded research paper content. If the answer is not in the content, say so.\n\nQuestion: {question}\n\nPaper Content:\n{paper_text[:30000]}"
        response = model.generate_content(qa_prompt)
        
        return jsonify({
            "answer": response.text
        }), 200
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return jsonify({"error": "Failed to generate AI response."}), 500

if __name__ == '__main__':
    # Run the app in debug mode on port 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
