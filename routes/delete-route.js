const express = require('express')
const router = express.Router()
const deleteController = require('../controllers/delete-controller')
const authMiddleware = require('../middleware/auth-middleware')

// =========================


// /delete
router.post('/', authMiddleware.isAuthor, deleteController.renderDeletionConfirmation)

router.post('/confirm', authMiddleware.isAuthor, deleteController.handleDeletion)





// =========================

module.exports = router