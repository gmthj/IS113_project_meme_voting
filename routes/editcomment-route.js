const express = require('express');
const router = express.Router();
const editController = require('../controllers/editcomment-controller');
const authMiddleware = require('../middleware/auth-middleware');

router.post('/', authMiddleware.isAuthor, editController.renderEditComment);

router.post('/confirm', authMiddleware.isAuthor, editController.handleEditConfirm);

module.exports = router;