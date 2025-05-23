// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { Tab, Tabs, TextField, Button } from '@mui/material';

export default function AuthPage() {
  const { register, login } = useSupabase();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'jobseeker' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 0) {
      await login(formData);
    } else {
      await register(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} className="mb-6">
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
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          {activeTab === 1 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 border rounded-md"
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
            className="mt-4"
          >
            {activeTab === 0 ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}