const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes')

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Gunakan Routes
app.use('/api/auth', authRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'SpaceSync API is running smoothly!' });
});

// Server Listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});