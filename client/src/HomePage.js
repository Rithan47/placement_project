import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function HomePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (you can store this in localStorage or context)
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
        <div className="nav-brand" style={{ color: 'white' }}>Hotel Management</div>
        <div className="nav-links">
          <button className="nav-link active">Home</button>
          <button className="nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="nav-link" onClick={() => navigate('/contact')}>Contact</button>
          <button className="nav-link" onClick={() => navigate('/order')}>Order</button>
          {user ? (
            <button className="nav-link logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to Our Hotel
            {user && <span className="user-welcome">, {user.username}!</span>}
          </h1>
          <p className="hero-subtitle">
            Experience luxury, comfort, and exceptional service at its finest
          </p>
          <div className="hero-buttons">
            <button className="hero-btn primary" onClick={() => navigate('/order')}>
              View Menu & Order
            </button>
            <button className="hero-btn secondary" onClick={() => navigate('/user-rooms')}>
              Book Room
            </button>
            <button className="hero-btn secondary" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🍽️</div>
              <h3>Fine Dining</h3>
              <p>Exquisite cuisine prepared by world-class chefs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏨</div>
              <h3>Luxury Rooms</h3>
              <p>Comfortable and elegant accommodations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>5-Star Service</h3>
              <p>Exceptional service that exceeds expectations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 