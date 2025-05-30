import React, { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, supabase } = useSupabase();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: '', company: '', bio: '' });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(async ({ data, error }) => {
        if (error && error.code === 'PGRST116') {
          // No profile exists, create one
          const { data: newProfile } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'jobseeker',
            full_name: '',
            company: '',
            bio: ''
          }).select().single();
          setProfile(newProfile);
          setForm({
            full_name: '',
            company: '',
            bio: ''
          });
        } else if (data) {
          setProfile(data);
          setForm({
            full_name: data?.full_name || '',
            company: data?.company || '',
            bio: data?.bio || ''
          });
        }
      });
  }, [user, supabase]);

  const handleSave = async () => {
    await supabase.from('profiles').update(form).eq('id', user.id);
    // Fetch the updated profile and update state
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
    setForm({
      full_name: data?.full_name || '',
      company: data?.company || '',
      bio: data?.bio || ''
    });
    toast.success('Profile updated!');
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <input className="w-full border rounded p-2 mb-2" placeholder="Full Name"
        value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
      <input className="w-full border rounded p-2 mb-2" placeholder="Company"
        value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
      <textarea className="w-full border rounded p-2 mb-2" placeholder="Bio"
        value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
    </div>
  );
}