import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">Hotel Management</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/home')}>Home</button>
          <button className="nav-link active">About</button>
          <button className="nav-link" onClick={() => navigate('/contact')}>Contact</button>
          <button className="nav-link" onClick={() => navigate('/order')}>Order</button>
        </div>
      </nav>

      <div className="about-content">
        <div className="container">
          <h1>About Our Hotel</h1>
          
          <div className="about-section">
            <h2>Our Story</h2>
            <p>
              Founded in 1995, our hotel has been providing exceptional hospitality services 
              for over 25 years. We pride ourselves on offering a perfect blend of luxury, 
              comfort, and authentic local experiences.
            </p>
          </div>

          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              To provide our guests with unforgettable experiences through personalized service, 
              world-class amenities, and a commitment to excellence in every detail.
            </p>
          </div>

          <div className="about-section">
            <h2>What We Offer</h2>
            <div className="offerings-grid">
              <div className="offering-item">
                <h3>🏨 Luxury Accommodations</h3>
                <p>Spacious rooms with modern amenities and stunning views</p>
              </div>
              <div className="offering-item">
                <h3>🍽️ Fine Dining</h3>
                <p>Multiple restaurants serving local and international cuisine</p>
              </div>
              <div className="offering-item">
                <h3>🏊‍♂️ Recreation</h3>
                <p>Swimming pool, spa, fitness center, and outdoor activities</p>
              </div>
              <div className="offering-item">
                <h3>🎯 Business Facilities</h3>
                <p>Conference rooms, business center, and event spaces</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>Awards & Recognition</h2>
            <ul className="awards-list">
              <li>🏆 5-Star Rating by International Hotel Association</li>
              <li>🌟 Best Luxury Hotel 2023 - Travel Awards</li>
              <li>🍽️ Excellence in Dining - Culinary Institute</li>
              <li>👥 Customer Choice Award - Hospitality Excellence</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage; 