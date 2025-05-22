from flask import Flask, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
from llama_cpp import Llama
import os

# Load environment variables
load_dotenv()

# Initialize Flask and Supabase
app = Flask(__name__)
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Initialize quantized Mistral-7B
model_path = "models/mistral-7b-instruct-v0.1.Q4_K_M.gguf"

llm = Llama(
    model_path=model_path,
    n_ctx=2048,        # Context window size
    n_threads=4,       # CPU threads
    n_gpu_layers=33    # Offload 33 layers to GPU (if available)
)

@app.route('/optimize', methods=['POST'])
def optimize_resume():
    try:
        resume_text = request.json.get('resume', '')[:3000]  # Limit input
        
        # Create optimization prompt
        prompt = f"""<s>[INST] 
        Optimize this resume for Applicant Tracking Systems (ATS):
        {resume_text}
        
        Focus on:
        - Adding missing keywords from software engineering job descriptions
        - Using action verbs like "developed", "implemented", "optimized"
        - Improving readability for automated systems
        - Maintaining factual accuracy
        [/INST]"""
        
        # Generate optimized resume
        output = llm.create_chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1000
        )
        
        optimized = output['choices'][0]['message']['content']
        
        return jsonify({
            "original": resume_text,
            "optimized": optimized,
            "model": "Mistral-7B-Q4_K_M"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)