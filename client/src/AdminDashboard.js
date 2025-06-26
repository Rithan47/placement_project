import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/admin-login');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="front-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="dashboard-options" style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <button className="front-btn primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }} onClick={() => navigate('/admin-menu')}>
          Menu Management
        </button>
        <button className="front-btn primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }} onClick={() => navigate('/admin-rooms')}>
          Hotel Management
        </button>
        <button className="front-btn primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }} onClick={() => navigate('/generated-bills')}>
          Generated Bills
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard; 