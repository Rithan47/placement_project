import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function UserRoomBooking() {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastBookingBill, setLastBookingBill] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const username = user?.username || '';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const [availRes, myRes] = await Promise.all([
        axios.get(`${API_URL}/available-rooms`),
        axios.get(`${API_URL}/my-rooms/${username}`)
      ]);
      setAvailableRooms(availRes.data);
      setMyRooms(myRes.data);
    } catch (err) {
      setError('Failed to fetch rooms.');
    }
    setLoading(false);
  };

  const handleBook = (room) => {
    setSelectedRoom(room);
    setShowPayment(true);
    setPaymentSuccess(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate payment success
    setTimeout(async () => {
      try {
        await axios.post(`${API_URL}/book-room/${selectedRoom._id}`, { username });
        // Create and save hotel bill
        const billData = {
          id: Date.now(),
          customerName: username,
          items: [{ name: `Room ${selectedRoom.roomNumber} (${selectedRoom.type})`, price: selectedRoom.rate, quantity: 1 }],
          total: selectedRoom.rate,
          date: new Date().toISOString(),
          type: 'hotel',
          roomNumber: selectedRoom.roomNumber,
          roomType: selectedRoom.type
        };
        const existingBills = JSON.parse(localStorage.getItem('generatedBills') || '[]');
        existingBills.push(billData);
        localStorage.setItem('generatedBills', JSON.stringify(existingBills));
        
        setLastBookingBill(billData);
        setPaymentSuccess(true);
        fetchRooms();
      } catch (err) {
        setError('Failed to book room.');
      }
      setLoading(false);
    }, 1000);
  };

  const handleLeave = async (roomId) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/leave-room/${roomId}`);
      fetchRooms();
    } catch (err) {
      setError('Failed to leave room.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/user-login');
  };

  const handleGeneratePdf = async () => {
    if (!lastBookingBill) return;
    try {
      const response = await axios.post(
        `${API_URL}/generate-bill`,
        { customerName: lastBookingBill.customerName, items: lastBookingBill.items },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bill_${lastBookingBill.customerName.replace(/\s+/g, "_")}_${lastBookingBill.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to generate bill PDF.");
    }
  };

  const handlePrint = () => {
    if (!lastBookingBill) return;
    const printContents = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hotel Room Bill</h2>
        <p><strong>Customer:</strong> ${lastBookingBill.customerName}</p>
        <p><strong>Date:</strong> ${new Date(lastBookingBill.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(lastBookingBill.date).toLocaleTimeString()}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #ccc; padding: 8px;">Item</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Rate</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Nights/Qty</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lastBookingBill.items.map(item => `
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
              <td style="font-weight: bold; border: 1px solid #ccc; padding: 8px;">₹${lastBookingBill.total}</td>
            </tr>
          </tfoot>
        </table>
        <p style="text-align: center; margin-top: 30px;">Thank you for staying with us!</p>
      </div>
    `;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Print Bill</title></head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  const handleCloseModal = () => {
    setShowPayment(false);
    setSelectedRoom(null);
    setLastBookingBill(null);
    setPaymentSuccess(false);
  };

  const pageStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1560200353-ce0a76b1d425?q=80&w=2072&auto=format&fit=crop')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    paddingTop: '80px',
  };

  return (
    <div className="user-room-booking-page" style={pageStyle}>
      <nav className="navbar">
        <div className="nav-brand">Hotel Management</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/home')}>Home</button>
          <button className="nav-link active">Book Room</button>
          <button className="nav-link" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="order-content">
        <div className="container">
          <h1>Book a Room</h1>
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">Loading...</div>}

          <h2>Available Rooms</h2>
          <div className="table-responsive">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Type</th>
                  <th>Rate</th>
                  <th>Facilities</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableRooms.length === 0 ? (
                  <tr><td colSpan={5}>No rooms available.</td></tr>
                ) : (
                  availableRooms.map(room => (
                    <tr key={room._id}>
                      <td>{room.roomNumber}</td>
                      <td>{room.type}</td>
                      <td>₹{room.rate}</td>
                      <td>{room.facilities}</td>
                      <td>
                        <button onClick={() => handleBook(room)} disabled={loading}>Book</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showPayment && selectedRoom && (
            <div className="payment-modal" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px #0003', padding: 24, maxWidth: 400, margin: '32px auto', textAlign: 'center' }}>
              <h3>Pay for Room {selectedRoom.roomNumber}</h3>
              <p>Type: {selectedRoom.type}</p>
              <p>Rate: <b>₹{selectedRoom.rate}</b></p>
              <p>Facilities: {selectedRoom.facilities}</p>
              <form onSubmit={handlePayment}>
                <input type="text" placeholder="Card Number" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8, width: '100%' }} />
                <input type="text" placeholder="Name on Card" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8, width: '100%' }} />
                <input type="text" placeholder="Expiry (MM/YY)" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8, width: '100%' }} />
                <input type="text" placeholder="CVV" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8, width: '100%' }} />
                <button type="submit" className="front-btn" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay & Book'}
                </button>
              </form>
              {paymentSuccess && (
                <div className="modal-content">
                  <div style={{ textAlign: 'center' }}>
                    <h3>Payment Successful!</h3>
                    <p>Your room has been booked.</p>
                    <div className="bill-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                      <button className="action-btn regenerate" onClick={handleGeneratePdf}>Download PDF</button>
                      <button className="action-btn print" onClick={handlePrint}>Print Bill</button>
                    </div>
                    <button onClick={handleCloseModal} style={{ marginTop: '1.5rem' }}>Close</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <h2 style={{ marginTop: 32 }}>My Booked Rooms</h2>
          <div className="table-responsive">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Type</th>
                  <th>Rate</th>
                  <th>Facilities</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myRooms.length === 0 ? (
                  <tr><td colSpan={6}>You have not booked any rooms.</td></tr>
                ) : (
                  myRooms.map(room => (
                    <tr key={room._id}>
                      <td>{room.roomNumber}</td>
                      <td>{room.type}</td>
                      <td>₹{room.rate}</td>
                      <td>{room.facilities}</td>
                      <td>{room.status}</td>
                      <td>
                        <button onClick={() => handleLeave(room._id)} disabled={loading}>Leave</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRoomBooking; 