import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import API_URL from './apiConfig';

function OrderPage() {
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const summaryRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
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
        return prev.filter((item) => item._id !== itemId);
      } else {
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

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item.");
      return;
    }
    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    setOrderPlaced(true);
    setShowSummary(true);
    setError("");
  };

  const handleGenerateBill = async () => {
    setPdfLoading(true);
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
      
      // Save bill to localStorage
      const billData = {
        id: Date.now(),
        customerName: tableNumber ? `${customerName} (Table ${tableNumber})` : customerName,
        items: items,
        total: subtotal,
        date: new Date().toISOString(),
        type: 'food'
      };
      
      const existingBills = JSON.parse(localStorage.getItem('generatedBills') || '[]');
      existingBills.push(billData);
      localStorage.setItem('generatedBills', JSON.stringify(existingBills));
      
      alert('Bill generated and saved successfully!');
    } catch (err) {
      alert("Failed to generate bill PDF.");
    }
    setPdfLoading(false);
  };

  const handlePrint = () => {
    if (summaryRef.current) {
      const printContents = summaryRef.current.innerHTML;
      const win = window.open('', '', 'height=700,width=900');
      win.document.write('<html><head><title>Print Bill</title>');
      win.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:center;} .total{font-weight:bold;}</style>');
      win.document.write('</head><body >');
      win.document.write(printContents);
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="order-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">Hotel Management</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/home')}>Home</button>
          <button className="nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="nav-link" onClick={() => navigate('/contact')}>Contact</button>
          <button className="nav-link active">Order</button>
        </div>
      </nav>

      <div className="order-content">
        <div className="container">
          <h1>Our Menu</h1>
          <p className="menu-description">Explore our delicious menu and place your order</p>
          <div style={{ marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Your Name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', marginRight: 8 }}
            />
            <input
              type="text"
              placeholder="Table Number (optional)"
              value={tableNumber}
              onChange={e => setTableNumber(e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">Loading menu...</div>}
          {!orderPlaced && (
            <>
              <div className="menu-grid">
                {menu.map((item) => {
                  const selected = selectedItems.find((sel) => sel._id === item._id);
                  return (
                    <div key={item._id} className={`menu-card ${selected ? 'selected' : ''}`}>
                      <div className="menu-card-content">
                        <h3>{item.name}</h3>
                        <p className="menu-description">{item.description}</p>
                        <div className="menu-price">₹{item.price}</div>
                        {selected ? (
                          <div className="quantity-controls">
                            <button 
                              onClick={() => handleQuantityChange(item._id, -1)}
                              disabled={selected.quantity <= 1}
                            >
                              -
                            </button>
                            <span>{selected.quantity}</span>
                            <button onClick={() => handleQuantityChange(item._id, 1)}>
                              +
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="add-to-cart-btn"
                            onClick={() => handleSelect(item._id)}
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedItems.length > 0 && (
                <div className="order-summary">
                  <h2>Your Order</h2>
                  <div className="order-items">
                    {getSelectedMenuItems().map(item => (
                      <div key={item._id} className="order-item">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>Total: ₹{subtotal}</strong>
                  </div>
                  <button 
                    className="place-order-btn"
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </button>
                </div>
              )}
            </>
          )}
          {orderPlaced && showSummary && (
            <div className="order-summary" ref={summaryRef}>
              <h2>Order Placed!</h2>
              <div style={{ marginBottom: 12 }}>Thank you, <b>{customerName}</b>! Your order has been placed.</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Item</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Price</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Qty</th>
                    <th style={{ border: '1px solid #ccc', padding: 8 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {getSelectedMenuItems().map(item => (
                    <tr key={item._id}>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{item.name}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>₹{item.price}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>{item.quantity}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold', border: '1px solid #ccc', padding: 8 }}>Total</td>
                    <td style={{ fontWeight: 'bold', border: '1px solid #ccc', padding: 8 }}>₹{subtotal}</td>
                  </tr>
                </tfoot>
              </table>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button className="front-btn" onClick={handleGenerateBill} disabled={pdfLoading}>
                  {pdfLoading ? 'Generating PDF...' : 'Generate Bill (PDF)'}
                </button>
                <button className="front-btn" onClick={handlePrint}>
                  Print Bill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderPage; 