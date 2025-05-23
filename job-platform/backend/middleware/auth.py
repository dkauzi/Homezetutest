from functools import wraps

def employer_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = supabase.auth.get_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        profile = supabase.table('profiles').select('role').eq('id', user.id).single().data
        if profile['role'] != 'employer':
            return jsonify({"error": "Employer access required"}), 403
        return f(*args, **kwargs)
    return decorated

def jobseeker_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = supabase.auth.get_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        profile = supabase.table('profiles').select('role').eq('id', user.id).single().data
        if profile['role'] != 'jobseeker':
            return jsonify({"error": "Jobseeker access required"}), 403
        return f(*args, **kwargs)
    return decorated