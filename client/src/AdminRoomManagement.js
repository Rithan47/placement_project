import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom';
import API_URL from './apiConfig';

function AdminRoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ roomNumber: '', type: '', rate: '', facilities: '', status: 'available' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/rooms`);
      setRooms(res.data);
    } catch (err) {
      setError('Failed to fetch rooms.');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editId) {
        await axios.put(`${API_URL}/rooms/${editId}`, { ...form, rate: Number(form.rate) });
      } else {
        await axios.post(`${API_URL}/rooms`, { ...form, rate: Number(form.rate) });
      }
      setForm({ roomNumber: '', type: '', rate: '', facilities: '', status: 'available' });
      setEditId(null);
      fetchRooms();
    } catch (err) {
      setError('Failed to save room.');
    }
    setLoading(false);
  };

  const handleEdit = (room) => {
    setForm({
      roomNumber: room.roomNumber,
      type: room.type,
      rate: room.rate,
      facilities: room.facilities,
      status: room.status
    });
    setEditId(room._id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      setError('Failed to delete room.');
    }
    setLoading(false);
  };

  return (
    <div className="admin-menu-container">
      <div className="admin-header">
        <h2>Hotel Management</h2>
        <div className="admin-header-actions">
          <button className="front-btn" onClick={() => navigate('/admin-dashboard')}>Go Back</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="menu-form">
        <input
          name="roomNumber"
          placeholder="Room Number"
          value={form.roomNumber}
          onChange={handleChange}
          required
        />
        <input
          name="type"
          placeholder="Type (e.g., Deluxe, Suite)"
          value={form.type}
          onChange={handleChange}
          required
        />
        <input
          name="rate"
          type="number"
          placeholder="Rate"
          value={form.rate}
          onChange={handleChange}
          required
        />
        <input
          name="facilities"
          placeholder="Facilities (comma separated)"
          value={form.facilities}
          onChange={handleChange}
          required
        />
        <select name="status" value={form.status} onChange={handleChange} required>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
        </select>
        <button type="submit" disabled={loading}>{editId ? 'Update' : 'Add'} Room</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ roomNumber: '', type: '', rate: '', facilities: '', status: 'available' }); }}>Cancel</button>}
      </form>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Type</th>
                <th>Rate</th>
                <th>Facilities</th>
                <th>Status</th>
                <th>Booked By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room._id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.type}</td>
                  <td>₹{room.rate}</td>
                  <td>{room.facilities}</td>
                  <td>{room.status}</td>
                  <td>{room.bookedBy || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(room)}>Edit</button>
                    <button onClick={() => handleDelete(room._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminRoomManagement; 