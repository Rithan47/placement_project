import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import FrontPage from './FrontPage';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import OrderPage from './OrderPage';
import GeneratedBillsPage from './GeneratedBillsPage';
import AdminLogin from './AdminLogin';
import UserLogin from './UserLogin';
import AdminSignup from './AdminSignup';
import UserSignup from './UserSignup';
import AdminRoomManagement from './AdminRoomManagement';
import UserRoomBooking from './UserRoomBooking';
import AdminDashboard from './AdminDashboard';
import AdminMenu from './AdminMenu';

const API_URL = 'http://localhost:5000/api';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/generated-bills" element={<GeneratedBillsPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/user-login" element={<UserLogin />} />
          
          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-menu" element={<AdminMenu />} />
          <Route path="/admin-rooms" element={<AdminRoomManagement />} />
          <Route path="/admin" element={<AdminDashboard />} /> {/* Redirect /admin to dashboard */}

          <Route path="/billing" element={<Billing />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/user-signup" element={<UserSignup />} />
          <Route path="/user-rooms" element={<UserRoomBooking />} />
        </Routes>
      </div>
    </Router>
  );
}

function Billing() {
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // [{_id, quantity}]
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/menu`);
      setMenu(res.data);
    } catch (err) {
      setError("Failed to fetch menu. Please check your server.");
    }
    setLoading(false);
  };

  const handleSelect = (itemId) => {
    setSelectedItems((prev) => {
      const found = prev.find((item) => item._id === itemId);
      if (found) {
        // Remove if already selected
        return prev.filter((item) => item._id !== itemId);
      } else {
        // Add with quantity 1
        return [...prev, { _id: itemId, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (itemId, delta) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item._id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleInputQuantity = (itemId, value) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item._id === itemId
          ? { ...item, quantity: Math.max(1, Number(value)) }
          : item
      )
    );
  };

  const getSelectedMenuItems = () =>
    selectedItems.map((sel) => {
      const menuItem = menu.find((m) => m._id === sel._id);
      return {
        ...menuItem,
        quantity: sel.quantity,
      };
    });

  const subtotal = getSelectedMenuItems().reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleGenerateBill = async () => {
    if (!customerName.trim()) {
      setError("Please enter the customer name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const items = getSelectedMenuItems().map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const response = await axios.post(
        `${API_URL}/generate-bill`,
        { customerName: tableNumber ? `${customerName} (Table ${tableNumber})` : customerName, items },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bill_${customerName.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError("Failed to generate bill PDF.");
    }
    setLoading(false);
  };

  return (
    <div className="billing-modern-container">
      <h2>Generate Customer Bill</h2>
      <div className="billing-customer-details">
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Table Number (optional)"
          value={tableNumber}
          onChange={e => setTableNumber(e.target.value)}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      <div className="billing-menu-table-wrapper">
        <table className="billing-menu-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item) => {
              const selected = selectedItems.find((sel) => sel._id === item._id);
              return (
                <tr key={item._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => handleSelect(item._id)}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>
                    {selected ? (
                      <div className="qty-controls">
                        <button type="button" onClick={() => handleQuantityChange(item._id, -1)} disabled={selected.quantity <= 1}>-</button>
                        <input
                          type="number"
                          min="1"
                          value={selected.quantity}
                          onChange={e => handleInputQuantity(item._id, e.target.value)}
                          style={{ width: 40, textAlign: 'center' }}
                        />
                        <button type="button" onClick={() => handleQuantityChange(item._id, 1)}>+</button>
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="billing-summary">
        <h3>Order Summary</h3>
        {getSelectedMenuItems().length === 0 ? (
          <div>No items selected.</div>
        ) : (
          <ul>
            {getSelectedMenuItems().map(item => (
              <li key={item._id}>
                {item.name} × {item.quantity} = ₹{item.price * item.quantity}
              </li>
            ))}
          </ul>
        )}
        <div className="billing-total">Total: ₹{subtotal}</div>
      </div>
      <button
        className="front-btn"
        style={{ marginTop: 24, minWidth: 180 }}
        onClick={handleGenerateBill}
        disabled={getSelectedMenuItems().length === 0 || !customerName.trim() || loading}
      >
        {loading ? 'Generating PDF...' : 'Generate Bill (PDF)'}
      </button>
    </div>
  );
}

export default App;
