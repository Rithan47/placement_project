import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import API_URL from './apiConfig';

function AdminSignup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (username !== 'admin') {
      setError('Admin username must be "admin".');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.status === 409) {
        setError('Admin already exists.');
      } else if (!res.ok) {
        setError('Signup failed.');
      } else {
        navigate('/admin-login');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Signup</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Signup'}</button>
          <button type="button" className="back-btn" onClick={() => navigate('/admin-login')}>Go Back</button>
        </div>
      </form>
    </div>
  );
}

export default AdminSignup; 