from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from datetime import datetime
import os
import traceback

# Create Flask app directly (not using factory pattern for Vercel)
app = Flask(__name__)
CORS(app)

def break_paragraph_smart(text, max_chars=2900):
    """Smart chunking - preserves sentence boundaries and punctuation"""
    print(f"break_paragraph_smart called with text length: {len(text)}, max_chars: {max_chars}")
    
    if len(text) <= max_chars:
        print("Text is within limit, returning as single chunk")
        return [text]
    
    chunks = []
    current_chunk = ""
    
    try:
        # Split by sentences first (preserves punctuation)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        print(f"Split into {len(sentences)} sentences")
        
        # Safety check: if no sentences found, split by words
        if len(sentences) <= 1:
            print("No sentence breaks found, splitting by words")
            words = text.split()
            sentences = []
            current_sentence = ""
            for word in words:
                if len(current_sentence + word) < max_chars // 2:
                    current_sentence += word + " "
                else:
                    if current_sentence:
                        sentences.append(current_sentence.strip())
                    current_sentence = word + " "
            if current_sentence:
                sentences.append(current_sentence.strip())
            print(f"Created {len(sentences)} word-based chunks")
        
        for i, sentence in enumerate(sentences):
            if len(current_chunk) + len(sentence) + 1 <= max_chars:
                current_chunk += sentence + " "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    print(f"Added chunk {len(chunks)}: {len(current_chunk.strip())} chars")
                
                # Handle oversized single sentences
                if len(sentence) > max_chars:
                    print(f"Sentence {i} is too long ({len(sentence)} chars), splitting by words")
                    words = sentence.split()
                    temp_chunk = ""
                    for word in words:
                        if len(temp_chunk + word) + 1 <= max_chars:
                            temp_chunk += word + " "
                        else:
                            if temp_chunk:
                                chunks.append(temp_chunk.strip())
                                print(f"Added word-split chunk {len(chunks)}: {len(temp_chunk.strip())} chars")
                            temp_chunk = word + " "
                    current_chunk = temp_chunk
                else:
                    current_chunk = sentence + " "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
            print(f"Added final chunk {len(chunks)}: {len(current_chunk.strip())} chars")
        
        print(f"break_paragraph_smart completed: {len(chunks)} chunks created")
        return chunks
        
    except Exception as e:
        print(f"Error in break_paragraph_smart: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        # Fallback: simple character-based splitting
        print("Using fallback character-based splitting")
        return [text[i:i+max_chars] for i in range(0, len(text), max_chars)]

def break_paragraph_simple(text, max_chars=2900):
    """Simple chunking - splits only at word boundaries without considering punctuation"""
    print(f"break_paragraph_simple called with text length: {len(text)}, max_chars: {max_chars}")
    
    if len(text) <= max_chars:
        print("Text is within limit, returning as single chunk")
        return [text]
    
    chunks = []
    words = text.split()
    current_chunk = ""
    
    try:
        for word in words:
            # Check if adding this word would exceed the limit
            if len(current_chunk) + len(word) + 1 <= max_chars:
                current_chunk += word + " "
            else:
                # Save current chunk if it exists
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    print(f"Added chunk {len(chunks)}: {len(current_chunk.strip())} chars")
                
                # Handle oversized single words
                if len(word) > max_chars:
                    print(f"Word too long ({len(word)} chars), splitting by characters")
                    # Split long words by characters
                    for i in range(0, len(word), max_chars):
                        chunk_part = word[i:i+max_chars]
                        chunks.append(chunk_part)
                        print(f"Added character-split chunk {len(chunks)}: {len(chunk_part)} chars")
                    current_chunk = ""
                else:
                    current_chunk = word + " "
        
        # Add the last chunk if it exists
        if current_chunk:
            chunks.append(current_chunk.strip())
            print(f"Added final chunk {len(chunks)}: {len(current_chunk.strip())} chars")
        
        print(f"break_paragraph_simple completed: {len(chunks)} chunks created")
        return chunks
        
    except Exception as e:
        print(f"Error in break_paragraph_simple: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        # Fallback: simple character-based splitting
        print("Using fallback character-based splitting")
        return [text[i:i+max_chars] for i in range(0, len(text), max_chars)]

def clean_transcript(text):
    print(f"clean_transcript called with text length: {len(text)}")
    
    try:
        original_length = len(text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        print(f"After whitespace cleanup: {len(text)} chars")
        
        # Remove speaker labels if present
        text = re.sub(r'^[A-Z][a-z]*:\s*', '', text, flags=re.MULTILINE)
        print(f"After speaker label removal: {len(text)} chars")
        
        # Remove timestamps
        text = re.sub(r'\[\d{2}:\d{2}:\d{2}\]', '', text)
        print(f"After timestamp removal: {len(text)} chars")
        
        cleaned = text.strip()
        print(f"clean_transcript completed: {original_length} -> {len(cleaned)} chars")
        return cleaned
        
    except Exception as e:
        print(f"Error in clean_transcript: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return text.strip()  # Return original text if cleaning fails

@app.route('/')
def home():
    return jsonify({
        'status': 'healthy',
        'message': 'Flask API is running',
        'timestamp': datetime.now().isoformat(),
        'endpoints': ['/api/health', '/api/chunk-text']
    })

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'API is running successfully'
    })

@app.route('/api/chunk-text', methods=['POST'])
def chunk_text():
    print("=== CHUNK TEXT REQUEST RECEIVED ===")
    
    try:
        # Log request details
        print(f"Request method: {request.method}")
        print(f"Request content type: {request.content_type}")
        
        # Get and validate request data
        data = request.get_json()
        print(f"Received data keys: {list(data.keys()) if data else 'None'}")
        
        if not data or 'text' not in data:
            print("ERROR: No text provided in request")
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        max_chars = data.get('max_chars', 2900)
        clean_transcript_flag = data.get('clean_transcript', True)
        method = data.get('method', 'smart')
        
        print(f"Text length: {len(text)}")
        print(f"Max chars: {max_chars}")
        print(f"Clean transcript: {clean_transcript_flag}")
        print(f"Method: {method}")
        
        # Add size limit (10MB)
        if len(text) > 10000000:
            print("ERROR: Text too large")
            return jsonify({'error': 'Text too large. Maximum 10MB allowed.'}), 400
        
        # Validate max_chars
        if max_chars < 10 or max_chars > 5000000:
            print("ERROR: Invalid max_chars value")
            return jsonify({'error': 'max_chars must be between 10 and 5000000'}), 400
        
        # Process the text
        original_length = len(text)
        
        if clean_transcript_flag:
            print("Starting text cleaning...")
            cleaned_text = clean_transcript(text)
        else:
            cleaned_text = text
        
        print(f"Starting text chunking with method: {method}")
        
        # Use the selected chunking method
        if method == 'simple':
            chunks = break_paragraph_simple(cleaned_text, max_chars)
        else:  # default to 'smart'
            chunks = break_paragraph_smart(cleaned_text, max_chars)
        
        # Prepare response
        response_data = {
            'success': True,
            'original_length': original_length,
            'cleaned_length': len(cleaned_text),
            'chunks': chunks,
            'chunk_count': len(chunks),
            'num_chunks': len(chunks),
            'method_used': method,
            'timestamp': datetime.now().isoformat()
        }
        
        print("=== RESPONSE READY ===")
        print(f"Method used: {method}")
        print(f"Number of chunks: {len(chunks)}")
        print(f"Chunk lengths: {[len(chunk) for chunk in chunks[:5]]}")
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"=== ERROR IN CHUNK_TEXT ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        
        return jsonify({
            'error': 'Internal server error', 
            'message': str(e),
            'type': type(e).__name__
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Route not found',
        'path': request.path,
        'available_endpoints': ['/', '/api/health', '/api/chunk-text']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    print(f"500 Error handler triggered: {error}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong on the server'
    }), 500

# This works for both local development and Vercel
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5101))
    print(f"Starting Flask app on port {port}")
    app.run(debug=True, host='0.0.0.0', port=port)
