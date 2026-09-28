// src/routes/bookingRoutes.js
const express = require('express');
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBookingByUser
} = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua route di bawah ini membutuhkan login (verifyToken)
router.use(verifyToken); 

// Routes untuk User Umum
router.post('/', createBooking);                      // User buat pesanan
router.get('/my-bookings', getUserBookings);          // User lihat riwayatnya sendiri
router.put('/:id/cancel', cancelBookingByUser);       // User membatalkan pesanannya

// Routes khusus Admin
router.get('/', isAdmin, getAllBookings);             // Admin lihat semua pesanan
router.put('/:id/status', isAdmin, updateBookingStatus); // Admin ubah status

module.exports = router;