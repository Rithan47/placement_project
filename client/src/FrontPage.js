import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function FrontPage() {
  const navigate = useNavigate();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  return (
    <div className="front-page-bg">
      <div className="front-page-content">
        <h1 className="front-title">Welcome to the Hotel Management System</h1>
        <p className="front-subtitle">Experience luxury and comfort at its finest</p>
        {!showLoginOptions ? (
          <button className="front-btn primary" onClick={() => setShowLoginOptions(true)}>
            Get Started
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <button className="front-btn secondary" onClick={() => navigate('/admin-login')}>Admin Login</button>
            <button className="front-btn secondary" onClick={() => navigate('/user-login')}>User Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FrontPage; 