const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/upload-controller')
const authMiddleware = require('../middleware/auth-middleware')


// =========================


// Inital Upload Page Loads -> /upload
router.get('/', authMiddleware.isLoggedIn, uploadController.renderUploadPage)
// Upload Page Handel Route
router.post('/', authMiddleware.isLoggedIn, uploadController.renderUploadPage_Mongo)

// /upload/edit
router.post('/edit', authMiddleware.isAuthor, uploadController.handleUploadEdit)
router.post('/update', uploadController.updateEditpost)



// =========================

module.exports = router