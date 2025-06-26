import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your server
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">Hotel Management</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/home')}>Home</button>
          <button className="nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="nav-link active">Contact</button>
          <button className="nav-link" onClick={() => navigate('/order')}>Order</button>
        </div>
      </nav>

      <div className="contact-content">
        <div className="container">
          <h1>Contact Us</h1>
          
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <h3>Address</h3>
                    <p>123 Hotel Street<br />City, State 12345<br />Country</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567<br />+1 (555) 987-6543</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">✉️</div>
                  <div>
                    <h3>Email</h3>
                    <p>info@hotelmanagement.com<br />reservations@hotelmanagement.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">🕒</div>
                  <div>
                    <h3>Hours</h3>
                    <p>24/7 Front Desk<br />Restaurant: 6 AM - 11 PM<br />Spa: 8 AM - 10 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage; 