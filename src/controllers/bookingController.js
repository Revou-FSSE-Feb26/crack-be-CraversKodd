// src/controllers/bookingController.js
const prisma = require('../config/prisma');

// [POST] /api/bookings (Protected: User/Admin)
// Membuat pesanan baru
const createBooking = async (req, res) => {
  try {
    const { workspaceId, date, startTime, endTime } = req.body;
    const userId = req.user.id; // Didapat dari authMiddleware (token)

    // 1. Validasi Input
    if (!workspaceId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Semua field (workspaceId, date, startTime, endTime) wajib diisi.' });
    }

    // 2. Cek ketersediaan Workspace & ambil harga per jam
    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace tidak ditemukan.' });
    }
    if (!workspace.isAvailable) {
      return res.status(400).json({ message: 'Maaf, Workspace ini sedang tidak tersedia.' });
    }

    // 3. Kalkulasi Durasi & Total Harga di Backend (Keamanan)
    // Asumsi format waktu HH:mm (contoh: "10:00")
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const diffInHours = (end - start) / (1000 * 60 * 60);

    if (diffInHours <= 0) {
      return res.status(400).json({ message: 'Waktu selesai harus lebih besar dari waktu mulai.' });
    }

    const totalPrice = diffInHours * workspace.pricePerHour;

    // 4. Simpan ke database
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        workspaceId: parseInt(workspaceId),
        date: new Date(date), // Pastikan format tanggal valid (YYYY-MM-DD)
        startTime,
        endTime,
        totalPrice,
        status: 'PENDING', // Default status
      },
    });

    res.status(201).json({
      message: 'Booking berhasil dibuat!',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// [GET] /api/bookings/my-bookings (Protected: User)
// Melihat riwayat pesanan milik user yang sedang login
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        workspace: {
          select: { name: true, imageUrl: true } // Hanya ambil nama dan gambar ruangan
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// [GET] /api/bookings (Protected: ADMIN)
// Melihat semua pesanan dari semua user
const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        workspace: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// [PUT] /api/bookings/:id/status (Protected: ADMIN)
// Mengubah status pesanan (CONFIRMED / CANCELLED)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "CONFIRMED" atau "CANCELLED"

    if (!['CONFIRMED', 'CANCELLED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.status(200).json({
      message: `Status booking berhasil diubah menjadi ${status}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// [PUT] /api/bookings/:id/cancel (Protected: User)
// User membatalkan pesanan miliknya sendiri
const cancelBookingByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({ where: { id: parseInt(id) } });

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    // Pastikan booking ini milik user yang sedang login
    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Akses ditolak. Ini bukan pesanan Anda.' });
    }

    // Hanya bisa dibatalkan jika statusnya masih PENDING
    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Hanya pesanan berstatus PENDING yang dapat dibatalkan.' });
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({
      message: 'Booking berhasil dibatalkan.',
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBookingByUser,
};