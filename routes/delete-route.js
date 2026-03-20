const express = require('express')
const router = express.Router()
const deleteController = require('../controllers/delete-controller')
const authMiddleware = require('../middleware/auth-middleware')

// =========================


// /delete
// router.get('/', deleteController.handleDeletion)
router.post('/', authMiddleware.isAuthor, deleteController.handleDeletion)

router.post('/confirm', authMiddleware.isAuthor, deleteController.handleDeletionConfirm)





// =========================

module.exports = router