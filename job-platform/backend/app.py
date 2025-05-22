from flask import Flask, request, jsonify
from supabase import create_client
from transformers import pipeline
import os
from ulid import ULID
from dotenv import load_dotenv
load_dotenv() 

app = Flask(__name__)
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Load quantized LLaMA-3-8B
llm = pipeline("text-generation", 
              model="meta-llama/Meta-Llama-3-8B",
              device_map="auto",
              torch_dtype="auto")

@app.route('/optimize', methods=['POST'])
def optimize_resume():
    try:
        resume = request.json.get('resume', '')
        prompt = f"""Optimize this resume for Applicant Tracking Systems:
        {resume[:3000]}
        Focus on:
        - Adding missing keywords
        - Improving action verbs
        - ATS-friendly formatting
        Output:"""
        
        optimized = llm(prompt, 
                       max_new_tokens=1000,
                       temperature=0.7)[0]['generated_text']
        
        return jsonify({
            "original": resume,
            "optimized": optimized.split("Output:")[-1].strip()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/jobs', methods=['POST'])
def create_job():
    job_data = request.json
    result = supabase.table('jobs').insert(job_data).execute()
    return jsonify(result.data)

@app.route('/match', methods=['POST'])
def match_jobs():
    resume = request.json.get('resume', '')
    
    # Simple keyword matching
    jobs = supabase.table('jobs').select('*').execute()
    matches = [job for job in jobs.data if any(
        kw.lower() in resume.lower() for kw in job['keywords'])]
    
    return jsonify({"matches": matches[:10]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
