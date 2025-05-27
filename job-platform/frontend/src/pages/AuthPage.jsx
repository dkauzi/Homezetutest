// src/pages/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { Tab, Tabs, TextField, Button } from '@mui/material';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const { user, register, login } = useSupabase();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    role: 'jobseeker' 
  });
  const navigate = useNavigate();

  // Handle redirection when user state changes
  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role || 'jobseeker';
      const dashboardPath = role === 'employer' ? '/employer' : '/jobseeker';
      navigate(dashboardPath);
    }
  }, [user]); // Removed navigate from dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 0) {
        // Login flow
        await login(formData);
      } else {
        // Registration flow
        if (!formData.email.includes('@') || formData.password.length < 6) {
          throw new Error('Invalid email or password (must be at least 6 characters)');
        }
        
        let companyName;
        if (formData.role === 'employer') {
          companyName = prompt('Please enter your company name:');
          if (!companyName) throw new Error('Company name is required for employers');
        }

        await register({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          company_name: companyName
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)} 
          className="mb-6"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            inputProps={{ minLength: 6 }}
            variant="outlined"
          />

          {activeTab === 1 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            className="mt-4 h-12"
          >
            {activeTab === 0 ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}