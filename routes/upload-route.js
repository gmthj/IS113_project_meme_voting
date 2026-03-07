const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/upload-controller')

// =========================


// /upload
router.get('/', uploadController.renderUploadPage)





// =========================

module.exports = router