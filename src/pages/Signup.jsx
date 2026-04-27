import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FiMail, FiLock, FiHeart, FiEye, FiEyeOff } from 'react-icons/fi';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <FiHeart className="brand-icon" />
          <span>CoastEscorts</span>
        </div>
        <h2 className="auth-title">Join CoastEscorts</h2>
        <p className="auth-subtitle">Create an account to list your profile</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Confirm password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? <span className="spinner small" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
