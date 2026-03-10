const express = require('express')
const router = express.Router()
const deleteController = require('../controllers/delete-controller')
const authMiddleware = require('../middleware/auth-middleware')

// =========================


// /delete
// router.get('/', deleteController.handleDeletion)
router.get('/', authMiddleware.isAuthor, deleteController.handleDeletion)





// =========================

module.exports = router