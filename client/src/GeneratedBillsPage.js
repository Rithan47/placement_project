import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function GeneratedBillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = () => {
    const savedBills = localStorage.getItem('generatedBills');
    if (savedBills) {
      setBills(JSON.parse(savedBills));
    }
  };

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
        <h2>Hotel Management Bill</h2>
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

  const hotelBills = bills.filter(bill => bill.type === 'hotel');
  const foodBills = bills.filter(bill => bill.type === 'food');

  return (
    <div className="generated-bills-page">
      <nav className="navbar">
        <div className="nav-brand">Hotel Management</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/admin-dashboard')}>Go Back to Dashboard</button>
        </div>
      </nav>
      <div className="container">
        <h1>Generated Bills</h1>
        <p className="page-description">View and manage all generated bills</p>
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading bills...</div>}
        <div className="bills-section">
          <h2>Hotel Management Bills</h2>
          {hotelBills.length === 0 ? (
            <div className="no-bills">
              <h3>No hotel bills generated yet</h3>
            </div>
          ) : (
            <div className="bills-grid">
              {hotelBills.map(bill => (
                <div key={bill.id} className="bill-card">
                  <div className="bill-header">
                    <h3>Bill #{bill.id}</h3>
                    <span className="bill-date">
                      {new Date(bill.date).toLocaleDateString()} at {new Date(bill.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="bill-customer">
                    <strong>Customer:</strong> {bill.customerName}
                  </div>
                  <div className="bill-items">
                    <h4>Items:</h4>
                    <ul>
                      {bill.items.map((item, index) => (
                        <li key={index}>
                          {item.name} × {item.quantity} = ₹{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bill-total">
                    <strong>Total: ₹{bill.total}</strong>
                  </div>
                  <div className="bill-actions">
                    <button className="action-btn regenerate" onClick={() => handleRegeneratePDF(bill)}>Regenerate PDF</button>
                    <button className="action-btn print" onClick={() => handlePrint(bill)}>Print</button>
                    <button className="action-btn delete" onClick={() => handleDeleteBill(bill.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bills-section">
          <h2>Menu Management Bills</h2>
          {foodBills.length === 0 ? (
            <div className="no-bills">
              <h3>No food bills generated yet</h3>
            </div>
          ) : (
            <div className="bills-grid">
              {foodBills.map(bill => (
                <div key={bill.id} className="bill-card">
                  <div className="bill-header">
                    <h3>Bill #{bill.id}</h3>
                    <span className="bill-date">
                      {new Date(bill.date).toLocaleDateString()} at {new Date(bill.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="bill-customer">
                    <strong>Customer:</strong> {bill.customerName}
                  </div>
                  <div className="bill-items">
                    <h4>Items:</h4>
                    <ul>
                      {bill.items.map((item, index) => (
                        <li key={index}>
                          {item.name} × {item.quantity} = ₹{item.price * item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bill-total">
                    <strong>Total: ₹{bill.total}</strong>
                  </div>
                  <div className="bill-actions">
                    <button className="action-btn regenerate" onClick={() => handleRegeneratePDF(bill)}>Regenerate PDF</button>
                    <button className="action-btn print" onClick={() => handlePrint(bill)}>Print</button>
                    <button className="action-btn delete" onClick={() => handleDeleteBill(bill.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneratedBillsPage; 