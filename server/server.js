const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection with error handling
let isMongoConnected = false;
mongoose.connect('mongodb://localhost:27017/hotel_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  isMongoConnected = true;
}).catch((err) => {
  console.log('MongoDB connection failed. Running in demo mode with in-memory data.');
  console.log('To use full functionality, please install and start MongoDB.');
  isMongoConnected = false;
});

const menuSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});
const Menu = mongoose.model('Menu', menuSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// Room Schema and Model
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, unique: true },
  type: String,
  rate: Number,
  facilities: String,
  status: { type: String, default: 'available' }, // 'available' or 'booked'
  bookedBy: { type: String, default: '' }, // username of user who booked
});
const Room = mongoose.model('Room', roomSchema);

// In-memory data for demo mode
let demoMenu = [
  { _id: '1', name: 'Chicken Biryani', description: 'Aromatic rice with tender chicken', price: 250 },
  { _id: '2', name: 'Butter Chicken', description: 'Creamy tomato-based curry', price: 180 },
  { _id: '3', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 150 },
  { _id: '4', name: 'Dal Makhani', description: 'Creamy black lentils', price: 120 },
  { _id: '5', name: 'Naan Bread', description: 'Soft Indian bread', price: 30 },
  { _id: '6', name: 'Gulab Jamun', description: 'Sweet dessert balls', price: 80 }
];

let demoUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'user123' }
];

let demoRooms = [
  { _id: '101', roomNumber: '101', type: 'Deluxe', rate: 2000, facilities: 'AC, TV, WiFi', status: 'available', bookedBy: '' },
  { _id: '102', roomNumber: '102', type: 'Suite', rate: 3500, facilities: 'AC, TV, WiFi, Bathtub', status: 'available', bookedBy: '' },
  { _id: '103', roomNumber: '103', type: 'Standard', rate: 1200, facilities: 'Fan, TV', status: 'available', bookedBy: '' },
];

// CRUD for Menu
app.get('/api/menu', async (req, res) => {
  if (isMongoConnected) {
    try {
      const menu = await Menu.find();
      res.json(menu);
    } catch (err) {
      res.json(demoMenu);
    }
  } else {
    res.json(demoMenu);
  }
});

app.post('/api/menu', async (req, res) => {
  const { name, description, price } = req.body;
  if (isMongoConnected) {
    try {
      const menuItem = new Menu({ name, description, price });
      await menuItem.save();
      res.json(menuItem);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save menu item' });
    }
  } else {
    const newItem = { _id: Date.now().toString(), name, description, price };
    demoMenu.push(newItem);
    res.json(newItem);
  }
});

app.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  if (isMongoConnected) {
    try {
      const menuItem = await Menu.findByIdAndUpdate(id, { name, description, price }, { new: true });
      res.json(menuItem);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  } else {
    const index = demoMenu.findIndex(item => item._id === id);
    if (index !== -1) {
      demoMenu[index] = { ...demoMenu[index], name, description, price };
      res.json(demoMenu[index]);
    } else {
      res.status(404).json({ error: 'Menu item not found' });
    }
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  if (isMongoConnected) {
    try {
      await Menu.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  } else {
    const index = demoMenu.findIndex(item => item._id === id);
    if (index !== -1) {
      demoMenu.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Menu item not found' });
    }
  }
});

// Bill PDF generation
app.post('/api/generate-bill', (req, res) => {
  try {
    const { customerName, items } = req.body;
    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid bill data' });
    }
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=bill.pdf',
        'Content-Length': pdfData.length,
      });
      res.end(pdfData);
    });

    // IMPORTANT: Place logo.png in the server directory
    // Draw header bar first
    doc.rect(0, 0, 612, 100).fill('#007bff');

    // Try to add a small food logo at the top-left from local file
    try {
      doc.image(__dirname + '/logo.png', 50, 30, { width: 50, height: 50 });
    } catch (e) {
      // If image fails, continue without it
    }

    // Restaurant name
    doc.fillColor('white').fontSize(28).font('Helvetica-Bold').text('Hotel Management Bill', 110, 45, { align: 'left' });
    doc.fillColor('black').font('Helvetica');
    doc.moveDown(2);

    // Customer details
    doc.fontSize(14).text(`Customer: ${customerName}`, 50, 120);
    doc.moveDown(0.5);

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#007bff');
    doc.moveDown(0.5);

    // Table header
    doc.fontSize(14).font('Helvetica-Bold');
    const startY = doc.y;
    doc.text('No.', 60, startY, { width: 30, align: 'left' });
    doc.text('Item', 100, startY, { width: 180, align: 'left' });
    doc.text('Price', 300, startY, { width: 60, align: 'right' });
    doc.text('Qty', 370, startY, { width: 40, align: 'right' });
    doc.text('Total', 430, startY, { width: 80, align: 'right' });
    doc.font('Helvetica');

    let total = 0;
    let rowY = startY + 22;
    items.forEach((item, idx) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      doc.text(`${idx + 1}`, 60, rowY, { width: 30, align: 'left' });
      doc.text(item.name, 100, rowY, { width: 180, align: 'left' });
      doc.text(`${item.price}`, 300, rowY, { width: 60, align: 'right' });
      doc.text(`${item.quantity}`, 370, rowY, { width: 40, align: 'right' });
      doc.text(`${itemTotal}`, 430, rowY, { width: 80, align: 'right' });
      rowY += 22; // Add vertical space between rows
    });
    doc.moveTo(50, rowY).lineTo(550, rowY).stroke('#007bff');
    rowY += 10;

    // Total
    doc.fontSize(16).fillColor('#007bff').text(`Total: ${total}`, 370, rowY, { width: 140, align: 'right' }).fillColor('black');

    // Thank you note
    rowY += 40;
    doc.fontSize(14).fillColor('#28a745').text('Thank you for dining with us!', 50, rowY, { width: 500, align: 'center' }).fillColor('black');

    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate bill PDF' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    if (isMongoConnected) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      const user = new User({ username, password });
      await user.save();
      res.json({ success: true });
    } else {
      const existing = demoUsers.find(user => user.username === username);
      if (existing) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      demoUsers.push({ username, password });
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    if (isMongoConnected) {
      const user = await User.findOne({ username, password });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ success: true });
    } else {
      const user = demoUsers.find(user => user.username === username && user.password === password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all rooms
app.get('/api/rooms', async (req, res) => {
  if (isMongoConnected) {
    try {
      const rooms = await Room.find();
      res.json(rooms);
    } catch (err) {
      res.json(demoRooms);
    }
  } else {
    res.json(demoRooms);
  }
});

// Admin: Add a room
app.post('/api/rooms', async (req, res) => {
  const { roomNumber, type, rate, facilities } = req.body;
  if (isMongoConnected) {
    try {
      const room = new Room({ roomNumber, type, rate, facilities, status: 'available', bookedBy: '' });
      await room.save();
      res.json(room);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add room' });
    }
  } else {
    const newRoom = { _id: Date.now().toString(), roomNumber, type, rate, facilities, status: 'available', bookedBy: '' };
    demoRooms.push(newRoom);
    res.json(newRoom);
  }
});

// Admin: Edit a room
app.put('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { roomNumber, type, rate, facilities, status, bookedBy } = req.body;
  if (isMongoConnected) {
    try {
      const room = await Room.findByIdAndUpdate(id, { roomNumber, type, rate, facilities, status, bookedBy }, { new: true });
      res.json(room);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update room' });
    }
  } else {
    const index = demoRooms.findIndex(room => room._id === id);
    if (index !== -1) {
      demoRooms[index] = { ...demoRooms[index], roomNumber, type, rate, facilities, status, bookedBy };
      res.json(demoRooms[index]);
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  }
});

// Admin: Delete a room
app.delete('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  if (isMongoConnected) {
    try {
      await Room.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete room' });
    }
  } else {
    const index = demoRooms.findIndex(room => room._id === id);
    if (index !== -1) {
      demoRooms.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  }
});

// User: Get available rooms
app.get('/api/available-rooms', async (req, res) => {
  if (isMongoConnected) {
    try {
      const rooms = await Room.find({ status: 'available' });
      res.json(rooms);
    } catch (err) {
      res.json(demoRooms.filter(r => r.status === 'available'));
    }
  } else {
    res.json(demoRooms.filter(r => r.status === 'available'));
  }
});

// User: Book a room
app.post('/api/book-room/:id', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  if (isMongoConnected) {
    try {
      const room = await Room.findByIdAndUpdate(id, { status: 'booked', bookedBy: username }, { new: true });
      res.json(room);
    } catch (err) {
      res.status(500).json({ error: 'Failed to book room' });
    }
  } else {
    const index = demoRooms.findIndex(room => room._id === id);
    if (index !== -1 && demoRooms[index].status === 'available') {
      demoRooms[index].status = 'booked';
      demoRooms[index].bookedBy = username;
      res.json(demoRooms[index]);
    } else {
      res.status(400).json({ error: 'Room not available' });
    }
  }
});

// User: Leave a room
app.post('/api/leave-room/:id', async (req, res) => {
  const { id } = req.params;
  if (isMongoConnected) {
    try {
      const room = await Room.findByIdAndUpdate(id, { status: 'available', bookedBy: '' }, { new: true });
      res.json(room);
    } catch (err) {
      res.status(500).json({ error: 'Failed to leave room' });
    }
  } else {
    const index = demoRooms.findIndex(room => room._id === id);
    if (index !== -1 && demoRooms[index].status === 'booked') {
      demoRooms[index].status = 'available';
      demoRooms[index].bookedBy = '';
      res.json(demoRooms[index]);
    } else {
      res.status(400).json({ error: 'Room not booked' });
    }
  }
});

// User: Get rooms booked by user
app.get('/api/my-rooms/:username', async (req, res) => {
  const { username } = req.params;
  if (isMongoConnected) {
    try {
      const rooms = await Room.find({ bookedBy: username });
      res.json(rooms);
    } catch (err) {
      res.json(demoRooms.filter(r => r.bookedBy === username));
    }
  } else {
    res.json(demoRooms.filter(r => r.bookedBy === username));
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!isMongoConnected) {
    console.log('Demo mode: Using in-memory data');
    console.log('Demo users: admin/admin123, user/user123');
  }
}); 