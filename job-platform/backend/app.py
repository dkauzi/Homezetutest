from flask import Flask, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
from transformers import pipeline
from functools import wraps
import torch
import os
import bleach
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# Initialize AI model
resume_optimizer = pipeline(
    "text2text-generation",
    model="google/flan-t5-base",
    device=0 if torch.cuda.is_available() else -1
)

# Authentication middleware
def employer_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user = supabase.auth.get_user()
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
                
            profile = supabase.table('profiles') \
                .select('role') \
                .eq('id', user.id) \
                .single().data
                
            if profile['role'] != 'employer':
                return jsonify({"error": "Employer access required"}), 403
                
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return decorated

def jobseeker_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user = supabase.auth.get_user()
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
                
            profile = supabase.table('profiles') \
                .select('role') \
                .eq('id', user.id) \
                .single().data
                
            if profile['role'] != 'jobseeker':
                return jsonify({"error": "Jobseeker access required"}), 403
                
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return decorated

# Routes
@app.route('/api/register', methods=['POST'])
# @limiter.limit("5 per hour")
def register():
    data = request.json
    try:
        # Use Supabase Admin Client (bypasses RLS)
        admin_client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # <-- Use SERVICE ROLE KEY
        )

        # 1. Create auth user
        auth_resp = admin_client.auth.sign_up({
            "email": data['email'],
            "password": data['password'],
            "options": {
                "data": {  # Include metadata
                    "role": data['role'],
                    "company_name": data.get('company_name')
                }
            },
              "email_confirm": True  # Auto-confirm email
        })


                # Add delay for trigger execution
        import time
        time.sleep(1)  # ⬅️ Allow 1s for trigger to complete

        # 2. Verify user exists
        user = admin_client.auth.admin.get_user_by_id(auth_resp.user.id)
        if not auth_resp.user:
            raise Exception("User creation failed")

        # 3. Insert profile using service role
        profile = admin_client.table('profiles').insert({
            "id": auth_resp.user.id,
            "email": data['email'],
            "role": data['role'],
            "company_name": data.get('company_name', None)
        }).execute()

        return jsonify({
            "message": "Registration successful",
            "user_id": auth_resp.user.id,
            "profile": profile.data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per hour")
def login():
    try:
        data = request.json
        response = supabase.auth.sign_in_with_password({
            "email": data['email'],
            "password": data['password']
        })
        return jsonify({
            "access_token": response.session.access_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/jobs', methods=['POST'])
@employer_required
@limiter.limit("5 per hour")
def create_job():
    try:
        user = supabase.auth.get_user()
        data = request.json
        
        if not all(key in data for key in ['title', 'description']):
            return jsonify({"error": "Missing required fields"}), 400

        # Sanitize input
        clean_data = {
            "employer_id": user.id,
            "title": bleach.clean(data['title']),
            "description": bleach.clean(data['description'], tags=['p', 'br', 'ul', 'li']),
            "location": bleach.clean(data.get('location', '')),
            "salary_range": bleach.clean(data.get('salary_range', ''))
        }

        job = supabase.table('jobs').insert(clean_data).execute()
        return jsonify(job.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = supabase.table('jobs') \
            .select('*, profiles:employer_id (company_name)') \
            .order('created_at', {'ascending': False}) \
            .execute()
            
        return jsonify(jobs.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/optimize', methods=['POST'])
def optimize():
    try:
        data = request.get_json()
        resume = data.get('resume')
        job_description = data.get('job_description')
        if not resume or not job_description:
            return jsonify({"error": "Missing resume or job_description"}), 400

        # Simulate optimization (replace with your logic)
        optimized_resume = resume + "\n\n[Optimized for: " + job_description[:50] + "...]"

        return jsonify({"optimized_resume": optimized_resume})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/applications', methods=['POST'])
@jobseeker_required
def submit_application():
    try:
        user = supabase.auth.get_user()
        data = request.json
        
        if not all(key in data for key in ['job_id', 'original_resume', 'optimized_resume']):
            return jsonify({"error": "Missing required fields"}), 400

        application_data = {
            "job_id": data['job_id'],
            "applicant_id": user.id,
            "original_resume": bleach.clean(data['original_resume']),
            "optimized_resume": bleach.clean(data['optimized_resume'])
        }

        application = supabase.table('applications').insert(application_data).execute()
        return jsonify(application.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications', methods=['GET'])
@employer_required
def get_applications():
    try:
        user = supabase.auth.get_user()
        applications = supabase.table('applications') \
            .select('*, jobs(*), profiles:applicant_id (email)') \
            .eq('jobs.employer_id', user.id) \
            .execute()
            
        return jsonify(applications.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)