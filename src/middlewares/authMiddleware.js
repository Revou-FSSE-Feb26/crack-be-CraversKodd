// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Middleware untuk mengecek apakah user memiliki token yang valid
const verifyToken = (req, res, next) => {
  // Ambil token dari header 'Authorization: Bearer <token>'
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Simpan data payload (id, role) ke request object agar bisa dipakai di controller
    req.user = decoded; 
    next(); // Lanjutkan ke controller / middleware berikutnya
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};

// 2. Middleware khusus untuk membatasi akses hanya untuk ADMIN
const isAdmin = (req, res, next) => {
  // Pastikan verifyToken dipanggil sebelum ini agar req.user tersedia
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Akses ditolak. Fitur ini hanya untuk Admin.' });
  }
};

module.exports = { verifyToken, isAdmin };