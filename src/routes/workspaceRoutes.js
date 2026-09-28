// src/routes/workspaceRoutes.js
const express = require('express');
const {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = require('../controllers/workspaceController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes (Bisa diakses siapa saja, termasuk yang belum login)
router.get('/', getAllWorkspaces);
router.get('/:id', getWorkspaceById);

// Protected Routes (Hanya boleh diakses oleh ADMIN)
router.post('/', verifyToken, isAdmin, createWorkspace);
router.put('/:id', verifyToken, isAdmin, updateWorkspace);
router.delete('/:id', verifyToken, isAdmin, deleteWorkspace);

module.exports = router;