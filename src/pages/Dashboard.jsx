import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMapPin, FiPhone, FiSave, FiUpload, FiHeart, FiLoader, FiCamera } from 'react-icons/fi';

const LOCATIONS = ['Nairobi', 'Mombasa', 'Kisumu'];
const GENDERS = ['Male', 'Female', 'Trans'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const photoRefs = [useRef(null), useRef(null), useRef(null)];

  const [form, setForm] = useState({
    name: '', location: '', contact: '', age: '',
    gender: '', services_offered: '',
    profile_image: '', photo_1: '', photo_2: '', photo_3: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (data) {
      setForm({
        name: data.name || '',
        location: data.location || '',
        contact: data.contact || '',
        age: data.age || '',
        gender: data.gender || '',
        services_offered: data.services_offered || '',
        profile_image: data.profile_image || '',
        photo_1: data.photo_1 || '',
        photo_2: data.photo_2 || '',
        photo_3: data.photo_3 || '',
      });
    }
    setLoading(false);
  };

  const uploadImage = async (file, field) => {
    setUploading(field);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${field}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true });
    if (uploadErr) { setError('Upload failed: ' + uploadErr.message); setUploading(''); return; }
    const { data: { publicUrl } } = supabase.storage.from('profile-images').getPublicUrl(path);
    setForm(prev => ({ ...prev, [field]: publicUrl }));
    setUploading('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = { ...form, user_id: user.id, age: form.age ? parseInt(form.age) : null };

    const { data: existing } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();

    let err;
    if (existing) {
      ({ error: err } = await supabase.from('profiles').update(payload).eq('user_id', user.id));
    } else {
      ({ error: err } = await supabase.from('profiles').insert([payload]));
    }

    if (err) setError(err.message);
    else setSuccess('Profile saved successfully!');
    setSaving(false);
  };

  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=e8a0b4&color=fff&size=200`;

  if (loading) return <div className="loading-state full-page"><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <FiHeart className="dash-icon" />
          <div>
            <h1>My Profile</h1>
            <p>Manage how you appear to others</p>
          </div>
        </div>

        {success && <div className="success-msg">{success}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSave} className="dashboard-form">
          {/* Main Profile Image */}
          <div className="photo-upload-section">
            <div className="main-photo-upload">
              <img
                src={form.profile_image || fallbackImage}
                alt="Profile"
                className="profile-preview"
                onError={e => { e.target.src = fallbackImage; }}
              />
              <button type="button" className="photo-upload-btn" onClick={() => fileRef.current.click()}>
                {uploading === 'profile_image' ? <FiLoader className="spin" /> : <FiCamera />}
                <span>Profile Photo</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'profile_image')} />
            </div>

            <div className="extra-photos">
              <p className="photos-label">Additional Photos (up to 3)</p>
              <div className="extra-photos-grid">
                {['photo_1', 'photo_2', 'photo_3'].map((field, i) => (
                  <div key={field} className="extra-photo-slot">
                    {form[field] ? (
                      <img src={form[field]} alt={`Photo ${i + 1}`}
                        onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="photo-placeholder"><FiCamera /></div>
                    )}
                    <button type="button" className="extra-upload-btn"
                      onClick={() => photoRefs[i].current.click()}>
                      {uploading === field ? <FiLoader className="spin" /> : <FiUpload />}
                    </button>
                    <input ref={photoRefs[i]} type="file" accept="image/*" hidden
                      onChange={e => e.target.files[0] && uploadImage(e.target.files[0], field)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label><FiUser /> Name</label>
              <input type="text" placeholder="Your display name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label><FiPhone /> Contact</label>
              <input type="tel" placeholder="+254 7XX XXX XXX" value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input type="number" placeholder="Age" min="18" max="99" value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label><FiMapPin /> Location</label>
              <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required>
                <option value="">Select city</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-group full-width">
              <label><FiHeart /> Services Offered</label>
              <textarea placeholder="e.g. Dinner dates, Travel companion, ... (comma separated)"
                value={form.services_offered}
                onChange={e => setForm({ ...form, services_offered: e.target.value })}
                rows={3}
              />
              <span className="field-hint">Separate services with commas</span>
            </div>
          </div>

          <button type="submit" className="btn-primary save-btn" disabled={saving}>
            {saving ? <><span className="spinner small" /> Saving...</> : <><FiSave /> Save Profile</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
