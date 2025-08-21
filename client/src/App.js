import React, { useState } from 'react';
import axios from 'axios';
import './style.css';

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/api/gemini', { prompt: query });
      setResult(res.data.result);
    } catch (err) {
      setResult({ error: 'Failed to get advice.' });
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h1>Smart Career Counselor AI</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={4}
          placeholder="Ask your career question..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading || !query}>
          {loading ? 'Thinking...' : 'Get Advice'}
        </button>
      </form>
      {result && (
        <div className="result">
          {result.error ? (
            <span>{result.error}</span>
          ) : (
            <>
              <strong>Advice:</strong> {result.advice || result.raw}<br />
              {result.reasoning && <><strong>Reasoning:</strong> {result.reasoning}</>}
              {result.steps && <><br /><strong>Steps:</strong> {result.steps.join(', ')}</>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
