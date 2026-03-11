const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/upload-controller')
const authMiddleware = require('../middleware/auth-middleware')


// =========================


// Inital Upload Page Loads 
router.get('/', authMiddleware.isLoggedIn, uploadController.renderUploadPage)
// Upload Page Handel Route
router.post('/', authMiddleware.isLoggedIn, uploadController.renderUploadPage_Mongo)

// /upload/edit
router.post('/edit', authMiddleware.isAuthor, uploadController.handleUploadEdit)



// =========================

module.exports = router