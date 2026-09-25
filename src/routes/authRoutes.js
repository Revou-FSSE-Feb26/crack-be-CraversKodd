// src/routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Public routes (Tidak butuh middleware)
router.post('/register', register);
router.post('/login', login);

module.exports = router;