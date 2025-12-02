const { Router } = require('express');
const notesController = require('../controllers/notes.controller');
const authMiddleware = require('../config/middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.post('/', notesController.createNote);
router.get('/', notesController.getUserNotes);
router.put('/:note_id', notesController.updateNote);
router.delete('/:note_id', notesController.deleteNote);

module.exports = router;
