import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function UserLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.status === 401) {
        setError('Invalid username or password.');
      } else if (!res.ok) {
        setError('Login failed.');
      } else {
        // Prevent admin from logging in here
        if (username === 'admin') {
          setError('Admin cannot login here.');
        } else {
          localStorage.setItem('loggedInUser', JSON.stringify({ username, userType: 'user' }));
          navigate('/home');
        }
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>User Login</h2>
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
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <button type="button" className="front-btn secondary" style={{marginTop: 10}} onClick={() => navigate('/user-signup')}>
          Sign Up
        </button>
        <button type="button" className="front-btn secondary" style={{marginTop: 10}} onClick={() => navigate('/')}>
          Go Back
        </button>
      </form>
    </div>
  );
}

export default UserLogin; 