from flask import Flask, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
from transformers import pipeline
import torch
import os

# Load environment variables
load_dotenv()

# Initialize Flask and Supabase
app = Flask(__name__)
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Initialize FLAN-T5 model
resume_optimizer = pipeline(
    "text2text-generation",
    model="google/flan-t5-base",
    device=0 if torch.cuda.is_available() else -1
)

@app.route('/optimize', methods=['POST'])
def optimize_resume():
    try:
        resume_text = request.json.get('resume', '')[:2000]  # Limit input
        
        # Create T5-style prompt
        prompt = f"Optimize this resume for Applicant Tracking Systems: {resume_text}"
        
        # Generate optimized resume
        result = resume_optimizer(
            prompt,
            max_length=1024,
            num_beams=4,
            temperature=0.7,
            do_sample=True
        )
        
        return jsonify({
            "original": resume_text,
            "optimized": result[0]['generated_text'],
            "model": "flan-t5-base"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)