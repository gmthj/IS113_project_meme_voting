const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/upload-controller')
const authMiddleware = require('../middleware/auth-middleware')


// =========================


// Inital Upload Page Loads -> /upload
router.get('/', authMiddleware.isLoggedIn, uploadController.renderUpload)
// Upload Page Handel Route
router.post('/', authMiddleware.isLoggedIn, uploadController.handleUpload)

// /upload/edit
router.post('/edit', authMiddleware.isAuthor, uploadController.renderEditPost)
router.post('/update', authMiddleware.isAuthor, uploadController.handleEditPost)



// =========================

module.exports = router