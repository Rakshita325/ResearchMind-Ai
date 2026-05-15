import React, { useState, useEffect } from 'react';

// Using functional component for React App
function App() {
  // State variables for managing app data
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);
  // State variables for managing app data
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const [summary, setSummary] = useState('');
  const [simplification, setSimplification] = useState('');
  
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadSuccess(false);
    }
  };

  // Handle form submission to upload the PDF
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');
    setSimplification('');
    setChatHistory([]); // Clear chat history on new upload

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Backend should run on localhost:5000 based on app.py
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload and process file');
      }

      // Update state with results from backend
      setSummary(data.summary);
      setSimplification(data.simplification);
      setUploadSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle asking questions about the paper
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    // Add user question to chat
    setChatHistory([...chatHistory, { role: 'user', content: currentQuestion }]);
    setQuestion('');
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      // Add bot answer to chat
      setChatHistory(prev => [...prev, { role: 'bot', content: data.answer }]);
    } catch (err) {
      setError(err.message);
      // Optional: remove the user message or show error in chat
    } finally {
      setChatLoading(false);
    }
  };

  // Helper to safely render text that might have simple markdown (like bullet points or bold)
  // For a truly simple app, we just render the text. In a production app, we'd use react-markdown.
  const formatText = (text) => {
    return text.split('\n').map((line, index) => {
      // Very basic formatting for bold and list items
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={index} style={{marginLeft: '1.5rem', marginBottom: '0.5rem'}}>{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      // Simple bold replacement
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={index}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div className="app-container">
      <button 
        className="theme-toggle" 
        onClick={() => setDarkMode(!darkMode)}
        title="Toggle dark mode"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <header className="header">
        <h1>ResearchMind AI</h1>
        <p>Your AI-powered research paper assistant</p>
      </header>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="card">
        <h2 className="section-title">Upload Research Paper</h2>
        <form onSubmit={handleUpload} className="upload-section">
          <div className="file-input-wrapper">
            <button type="button" className="btn" style={{backgroundColor: '#64748b'}}>
              Choose PDF File
            </button>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              disabled={loading}
            />
          </div>
          {file && <div className="file-name">Selected: {file.name}</div>}
          
          <button 
            type="submit" 
            className="btn" 
            disabled={!file || loading}
            style={{marginTop: '1rem'}}
          >
            {loading ? 'Processing Paper...' : 'Analyze Paper'}
          </button>
          
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <span>Extracting text and generating insights with Gemini...</span>
            </div>
          )}

          {uploadSuccess && !loading && (
            <div className="success-message">
              ✓ Paper successfully analyzed!
            </div>
          )}
        </form>
      </div>

      {/* Results Section */}
      {(summary || simplification) && (
        <div className="content-grid">
          <div className="card">
            <h2 className="section-title">Executive Summary</h2>
            <div className="markdown-content">
              {summary ? formatText(summary) : 'No summary generated.'}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Simplified Explanation</h2>
            <div className="markdown-content">
              {simplification ? formatText(simplification) : 'No simplification generated.'}
            </div>
          </div>
        </div>
      )}

      {/* Q&A Section */}
      {uploadSuccess && (
        <div className="card">
          <h2 className="section-title">Ask Questions About the Paper</h2>
          <div className="chat-section">
            
            {chatHistory.length > 0 && (
              <div className="chat-history">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <strong>{msg.role === 'user' ? 'You:' : 'ResearchMind AI:'}</strong>
                    <div style={{marginTop: '0.5rem'}}>
                      {formatText(msg.content)}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="message bot">
                    <div className="loading" style={{marginTop: 0}}>
                      <div className="spinner"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="E.g., What is the main conclusion of this study?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={chatLoading}
              />
              <button 
                type="submit" 
                className="btn"
                disabled={!question.trim() || chatLoading}
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
