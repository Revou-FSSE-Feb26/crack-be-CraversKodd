const prisma = require('../config/prisma');

const getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!workspace) return res.status(404).json({ message: 'Workspace tidak ditemukan.' });
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

const createWorkspace = async (req, res) => { /* prisma.workspace.create */ };
const updateWorkspace = async (req, res) => { /* prisma.workspace.update */ };
const deleteWorkspace = async (req, res) => { /* prisma.workspace.delete */ };

module.exports = { getAllWorkspaces, getWorkspaceById, createWorkspace, updateWorkspace, deleteWorkspace };