const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/', protect, notesController.createNote);
router.get('/', protect, notesController.getNotes);
router.get('/:id', protect, notesController.getNote);
router.put('/:id', protect, notesController.updateNote);
router.patch('/:id', protect, notesController.updateNoteStatus);
router.delete('/:id', protect, notesController.deleteNote);

module.exports = router;
