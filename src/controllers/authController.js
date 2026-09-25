// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// [POST] /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validasi Input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi!' });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar. Gunakan email lain.' });
    }

    // 3. Hash Password (Enkripsi)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER', // Default 'USER' jika tidak dikirim
      },
    });

    // Hapus password dari response demi keamanan
    delete newUser.password;

    res.status(201).json({
      message: 'Registrasi berhasil!',
      user: newUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// [POST] /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi Input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi!' });
    }

    // 2. Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // 3. Verifikasi Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password salah.' });
    }

    // 4. Buat JWT Token
    // Payload berisi informasi penting (hindari menyimpan data rahasia di sini)
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d', // Token kedaluwarsa dalam 1 hari
    });

    res.status(200).json({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = { register, login };