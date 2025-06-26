import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import API_URL from './apiConfig';

function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState({ name: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
    loadBills();
    // eslint-disable-next-line
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/menu`);
      setMenu(res.data);
    } catch (err) {
      setError('Failed to fetch menu. Please check your server.');
    }
    setLoading(false);
  };

  const loadBills = () => {
    const savedBills = localStorage.getItem('generatedBills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
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
        await axios.put(`${API_URL}/menu/${editId}`, { ...form, price: Number(form.price) });
      } else {
        await axios.post(`${API_URL}/menu`, { ...form, price: Number(form.price) });
      }
      setForm({ name: '', price: '' });
      setEditId(null);
      fetchMenu();
    } catch (err) {
      setError('Failed to save menu item.');
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, price: item.price });
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/menu/${id}`);
      fetchMenu();
    } catch (err) {
      setError('Failed to delete menu item.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/admin-login');
  };

  // Bill actions
  const handleRegeneratePDF = async (bill) => {
    try {
      const response = await axios.post(
        `${API_URL}/generate-bill`,
        { customerName: bill.customerName, items: bill.items },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bill_${bill.customerName.replace(/\s+/g, "_")}_${bill.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to regenerate bill PDF.");
    }
  };

  const handlePrint = (bill) => {
    const printContents = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Food Bill</h2>
        <p><strong>Customer:</strong> ${bill.customerName}</p>
        <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(bill.date).toLocaleTimeString()}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #ccc; padding: 8px;">Item</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Price</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Qty</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map(item => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">₹${item.price}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f0f0f0;">
              <td colspan="3" style="text-align: right; font-weight: bold; border: 1px solid #ccc; padding: 8px;">Total</td>
              <td style="font-weight: bold; border: 1px solid #ccc; padding: 8px;">₹${bill.total}</td>
            </tr>
          </tfoot>
        </table>
        <p style="text-align: center; margin-top: 30px;">Thank you for dining with us!</p>
      </div>
    `;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Print Bill</title>');
    win.document.write('</head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  const handleDeleteBill = (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      const updatedBills = bills.filter(bill => bill.id !== billId);
      setBills(updatedBills);
      localStorage.setItem('generatedBills', JSON.stringify(updatedBills));
    }
  };

  const foodBills = bills.filter(bill => bill.type === 'food');

  return (
    <div className="admin-menu-container">
      <div className="admin-header">
        <h2>Menu Management</h2>
        <div className="admin-header-actions">
          <button className="front-btn" onClick={() => navigate('/admin-dashboard')}>Go Back</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="menu-form">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>{editId ? 'Update' : 'Add'} Item</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', price: '' }); }}>Cancel</button>}
      </form>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => handleDelete(item._id)}>Delete</button>
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

export default AdminMenu; 