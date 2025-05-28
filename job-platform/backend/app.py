from flask import Flask, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
from functools import wraps
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

# For admin operations:
admin_client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
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

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = supabase.auth.get_user()
        profile = supabase.table('profiles').select('role').eq('id', user.id).single().data
        if profile['role'] != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated

def employer_or_admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user = supabase.auth.get_user()
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
            profile = supabase.table('profiles').select('role', 'is_active').eq('id', user.id).single().data
            if profile['role'] not in ['employer', 'admin']:
                return jsonify({"error": "Employer or Admin access required"}), 403
            if not profile.get('is_active', True):
                return jsonify({"error": "Account disabled. Contact admin."}), 403
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return decorated

# Routes
@app.route('/api/register', methods=['POST'])
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
                "data": {
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
@employer_or_admin_required
def create_job():
    user = supabase.auth.get_user()
    try:
        data = request.json

        if not all(key in data for key in ['title', 'description']):
            return jsonify({"error": "Missing required fields"}), 400

        clean_data = {
            "employer_id": user.id,
            "title": bleach.clean(data['title']),
            "description": bleach.clean(data['description'], tags=['p', 'br', 'ul', 'li']),
            "location": bleach.clean(data.get('location', '')),
            "salary": bleach.clean(data.get('salary', '')),
            "type": bleach.clean(data.get('type', '')),
            "company": bleach.clean(data.get('company', '')),
            "additional_questions": data.get('additional_questions', None)
        }

        job = supabase.table('jobs').insert(clean_data).execute()
        return jsonify(job.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = supabase.table('jobs') \
            .select('*') \
            .order('created_at', {'ascending': False}) \
            .execute()
            
        return jsonify(jobs.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications', methods=['POST'])
@jobseeker_required
def submit_application():
    try:
        user = supabase.auth.get_user()
        data = request.json

        # Fetch the job to check employer
        job = supabase.table('jobs').select('employer_id').eq('id', data['job_id']).single().execute()
        if job.data and job.data['employer_id'] == user.id:
            return jsonify({"error": "Employers cannot apply to their own job."}), 403

        if not all(key in data for key in ['job_id', 'original_resume']):
            return jsonify({"error": "Missing required fields"}), 400

        application_data = {
            "job_id": data['job_id'],
            "applicant_id": user.id,
            "original_resume": bleach.clean(data['original_resume']),
            "pdf_resume": data.get('pdf_resume'),
            "answers": data.get('answers', None)
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

@app.route('/api/users', methods=['GET'])
@admin_required
def list_users():
    users = supabase.table('profiles').select('*').execute()
    return jsonify(users.data)

@app.route('/api/users/<user_id>/status', methods=['PATCH'])
@admin_required
def set_user_status(user_id):
    data = request.json
    is_active = data.get('is_active')
    if is_active is None:
        return jsonify({"error": "Missing is_active"}), 400
    result = supabase.table('profiles').update({'is_active': is_active}).eq('id', user_id).execute()
    return jsonify(result.data)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)