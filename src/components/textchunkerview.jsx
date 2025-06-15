import React from 'react';
import axios from 'axios';
import config from '../config';

const TextChunkerView = ({
  backendStatus,
  checkBackendStatus,
  chunkerState,
  setChunkerState
}) => {
  // Simple handlers without event prevention in onChange
  const handleMaxCharsChange = (e) => {
    setChunkerState(prev => ({ ...prev, maxChars: e.target.value }));
  };

  const handleMaxCharsBlur = (e) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);
    
    if (value === '' || isNaN(numValue) || numValue < 100) {
      setChunkerState(prev => ({ ...prev, maxChars: 2900 }));
    } else {
      const clampedValue = Math.max(100, Math.min(50000, numValue));
      setChunkerState(prev => ({ ...prev, maxChars: clampedValue }));
    }
  };

  // Prevent form submission on Enter key only
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleChunkText = async () => {
    // Validate maxChars at the start of chunking
    let validMaxChars = parseInt(chunkerState.maxChars, 10);
    if (isNaN(validMaxChars) || validMaxChars < 100) {
      validMaxChars = 2900;
      setChunkerState(prev => ({ ...prev, maxChars: validMaxChars }));
    } else if (validMaxChars > 50000) {
      validMaxChars = 50000;
      setChunkerState(prev => ({ ...prev, maxChars: validMaxChars }));
    }

    // Validation for text input
    if (!chunkerState.inputText.trim()) {
      setChunkerState(prev => ({ 
        ...prev, 
        error: 'Please enter some text to chunk.' 
      }));
      return;
    }

    if (backendStatus !== 'connected') {
      setChunkerState(prev => ({ 
        ...prev, 
        error: 'Backend is not connected. Please check the server.' 
      }));
      return;
    }

    // Clear previous results and set loading
    setChunkerState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      result: null 
    }));

    try {
      console.log('Sending request to chunk-text endpoint');
      console.log('Request data:', {
        text: chunkerState.inputText.substring(0, 100) + '...',
        max_chars: validMaxChars,
        clean_transcript: chunkerState.cleanTranscript,
        method: chunkerState.method
      });
      
      const response = await axios.post(`${config.API_BASE_URL}/api/chunk-text`, {
        text: chunkerState.inputText,
        max_chars: validMaxChars,
        clean_transcript: chunkerState.cleanTranscript,
        method: chunkerState.method
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.chunks || !Array.isArray(response.data.chunks)) {
        throw new Error('Invalid response format from server');
      }

      // Check if too many chunks (performance protection)
      if (response.data.chunks.length > 200) {
        setChunkerState(prev => ({ 
          ...prev, 
          loading: false,
          error: `Too many chunks (${response.data.chunks.length}). Try using larger chunk size to reduce processing load.`
        }));
        return;
      }

      // Create mock statistics if not provided by backend
      const chunks = response.data.chunks;
      const chunk_sizes = chunks.map(chunk => chunk.length);
      const mockResult = {
        ...response.data,
        num_chunks: chunks.length,
        chunk_sizes: chunk_sizes,
        target_size: validMaxChars,
        method_used: chunkerState.method,
        statistics: {
          average_chunk_size: Math.round(chunk_sizes.reduce((a, b) => a + b, 0) / chunk_sizes.length) || 0,
          largest_chunk: Math.max(...chunk_sizes) || 0,
          smallest_chunk: Math.min(...chunk_sizes) || 0,
          efficiency: Math.round((chunk_sizes.reduce((a, b) => a + b, 0) / (chunks.length * validMaxChars)) * 100) || 0
        }
      };

      setChunkerState(prev => ({ 
        ...prev, 
        loading: false, 
        result: mockResult 
      }));

    } catch (error) {
      console.error('Error in handleChunkText:', error);
      
      let errorMessage = 'Failed to chunk text. ';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Try with smaller text.';
      } else if (error.response) {
        errorMessage += `Server error: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Check if backend is running.';
      } else {
        errorMessage += error.message;
      }

      setChunkerState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  };

  const downloadChunks = () => {
    if (!chunkerState.result) return;

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const content = [
      'VIDEO TRANSCRIPT - CHUNKED',
      '='.repeat(50),
      '',
      `Original text: ${chunkerState.result.original_length.toLocaleString()} characters`,
      `Cleaned text: ${chunkerState.result.cleaned_length.toLocaleString()} characters`,
      `Number of chunks: ${chunkerState.result.num_chunks}`,
      `Target chunk size: ${chunkerState.result.target_size.toLocaleString()} characters`,
      `Method used: ${chunkerState.result.method_used}`,
      `Generated on: ${new Date().toLocaleString()}`,
      '',
      '='.repeat(50),
      '',
      ...chunkerState.result.chunks.map((chunk, index) => 
        `CHUNK ${index + 1} OF ${chunkerState.result.num_chunks}\n` +
        `Characters: ${chunk.length.toLocaleString()} | Target: ${chunkerState.result.target_size.toLocaleString()}\n` +
        '-'.repeat(60) + '\n\n' +
        chunk + '\n\n' +
        '='.repeat(50) + '\n'
      )
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript_chunks_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setChunkerState(prev => ({
      ...prev,
      inputText: '',
      result: null,
      error: null
    }));
  };

  return (
    <div className="fade-in" style={{ marginTop: '20px' }}>
      <h2 className="resume-title">Video Transcript Chunker</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Break large video transcripts into smaller chunks for easier processing. 
        Automatically handles timestamps and speaker labels.
      </p>

      {/* Backend Status Indicator */}
      <div className="resume card-hover" style={{ 
        marginBottom: '20px',
        borderLeft: `4px solid ${backendStatus === 'connected' ? '#28a745' : '#dc3545'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>Backend Status: </strong>
            <span style={{ 
              color: backendStatus === 'connected' ? '#28a745' : '#dc3545',
              fontWeight: 'bold'
            }}>
              {backendStatus === 'connected' ? '✓ Connected' : 
               backendStatus === 'disconnected' ? '✗ Disconnected' : '⟳ Checking...'}
            </span>
          </div>
          <button 
            type="button"
            onClick={checkBackendStatus}
            className="resume-button"
            style={{ 
              padding: '6px 12px', 
              fontSize: '14px',
              backgroundColor: '#6c757d'
            }}
          >
            Refresh
          </button>
        </div>
        {backendStatus === 'disconnected' && (
          <p style={{ color: '#721c24', marginTop: '10px', marginBottom: 0 }}>
            Make sure the Flask server is running: <code>python api/index.py</code>
          </p>
        )}
      </div>

      {/* Settings Panel - Fixed to prevent form submission */}
      <div className="resume card-hover" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Settings</h3>
        
        {/* Wrap inputs in div, NOT form */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Max Characters per Chunk:
            </label>
            <input
              type="text"
              value={chunkerState.maxChars}
              onChange={handleMaxCharsChange}
              onBlur={handleMaxCharsBlur}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Enter max characters (100-50000)"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Default: 2900, Range: 100-50000
            </small>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Chunking Method:
            </label>
            <select
              value={chunkerState.method}
              onChange={(e) => setChunkerState(prev => ({ ...prev, method: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="smart">Smart (preserves punctuation)</option>
              <option value="simple">Simple (word boundaries only)</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={chunkerState.cleanTranscript}
              onChange={(e) => setChunkerState(prev => ({ 
                ...prev, 
                cleanTranscript: e.target.checked 
              }))}
              style={{ marginRight: '8px' }}
            />
            Clean transcript (remove timestamps, speaker labels)
          </label>
        </div>
      </div>

      {/* Input Panel - Fixed to prevent form submission */}
      <div className="resume card-hover" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Input Text</h3>
        
        <textarea
          value={chunkerState.inputText}
          onChange={(e) => setChunkerState(prev => ({ 
            ...prev, 
            inputText: e.target.value, 
            result: null, 
            error: null 
          }))}
          onKeyDown={(e) => {
            // Allow Enter in textarea for line breaks, but prevent form submission
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
            }
          }}
          placeholder="Paste your video transcript here..."
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            resize: 'vertical'
          }}
        />
        
        <div style={{ 
          marginTop: '15px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Characters: {chunkerState.inputText.length.toLocaleString()}
          </span>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={clearAll}
              disabled={!chunkerState.inputText && !chunkerState.result}
              className="resume-button"
              style={{
                backgroundColor: '#6c757d',
                cursor: (!chunkerState.inputText && !chunkerState.result) ? 'not-allowed' : 'pointer'
              }}
            >
              Clear All
            </button>
            
            <button
              type="button"
              onClick={handleChunkText}
              disabled={chunkerState.loading || !chunkerState.inputText.trim() || backendStatus !== 'connected'}
              className="resume-button"
              style={{
                backgroundColor: (chunkerState.loading || !chunkerState.inputText.trim() || backendStatus !== 'connected') ? '#6c757d' : '#007BFF',
                cursor: (chunkerState.loading || !chunkerState.inputText.trim() || backendStatus !== 'connected') ? 'not-allowed' : 'pointer'
              }}
            >
              {chunkerState.loading ? 'Processing...' : 'Chunk Text'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {chunkerState.error && (
        <div className="resume card-hover" style={{ 
          borderLeft: '4px solid #dc3545', 
          backgroundColor: '#f8d7da',
          marginBottom: '30px'
        }}>
          <p style={{ color: '#721c24', margin: 0 }}>{chunkerState.error}</p>
        </div>
      )}

      {/* Results Display */}
      {chunkerState.result && (
        <div className="resume card-hover" style={{ borderLeft: '4px solid #28a745' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Results</h3>
            <button 
              type="button"
              onClick={downloadChunks} 
              className="resume-button"
            >
              📥 Download Chunks
            </button>
          </div>
          
          {/* Statistics Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div>
              <strong>Original Length:</strong><br />
              {chunkerState.result.original_length.toLocaleString()} chars
            </div>
            <div>
              <strong>Cleaned Length:</strong><br />
              {chunkerState.result.cleaned_length.toLocaleString()} chars
            </div>
            <div>
              <strong>Number of Chunks:</strong><br />
              {chunkerState.result.num_chunks}
            </div>
            <div>
              <strong>Target Size:</strong><br />
              {chunkerState.result.target_size.toLocaleString()} chars
            </div>
            <div>
              <strong>Method Used:</strong><br />
              {chunkerState.result.method_used}
            </div>
            <div>
              <strong>Efficiency:</strong><br />
              {chunkerState.result.statistics.efficiency}%
            </div>
          </div>

          {/* Advanced Statistics */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Chunk Statistics:</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '10px' 
            }}>
              <div style={{ fontSize: '14px' }}>
                <strong>Average:</strong> {chunkerState.result.statistics.average_chunk_size.toLocaleString()} chars
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong>Largest:</strong> {chunkerState.result.statistics.largest_chunk.toLocaleString()} chars
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong>Smallest:</strong> {chunkerState.result.statistics.smallest_chunk.toLocaleString()} chars
              </div>
            </div>
          </div>

          {/* Chunk Sizes Visualization - Limited to first 50 for performance */}
          <h4 style={{ marginBottom: '15px' }}>Chunk Sizes:</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: '8px', 
            marginBottom: '20px' 
          }}>
            {chunkerState.result.chunk_sizes.slice(0, 50).map((size, index) => (
              <span key={index} style={{
                backgroundColor: '#e3f2fd',
                color: '#1565c0',
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                #{index + 1}: {size.toLocaleString()}
              </span>
            ))}
            {chunkerState.result.chunk_sizes.length > 50 && (
              <span style={{ color: '#666', fontSize: '14px', padding: '6px 12px' }}>
                ... and {chunkerState.result.chunk_sizes.length - 50} more
              </span>
            )}
          </div>

          {/* Chunks Preview - Limited to first 10 for performance */}
          <details style={{ marginTop: '20px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '16px'
            }}>
              📄 View Chunks Preview (First 10)
            </summary>
            <div style={{ 
              maxHeight: '500px', 
              overflowY: 'auto', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}>
              {chunkerState.result.chunks.slice(0, 10).map((chunk, index) => (
                <div key={index} style={{ 
                  padding: '15px', 
                  borderBottom: index < Math.min(9, chunkerState.result.chunks.length - 1) ? '1px solid #eee' : 'none' 
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '8px', 
                    color: '#007BFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Chunk {index + 1} of {chunkerState.result.num_chunks}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'normal' }}>
                      {chunk.length.toLocaleString()} characters
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontFamily: 'monospace', 
                    whiteSpace: 'pre-wrap',
                    backgroundColor: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '4px',
                    lineHeight: '1.4'
                  }}>
                    {chunk.length > 300 ? chunk.substring(0, 300) + '...' : chunk}
                  </div>
                </div>
              ))}
              {chunkerState.result.chunks.length > 10 && (
                <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                  ... and {chunkerState.result.chunks.length - 10} more chunks (download to see all)
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default TextChunkerView;
