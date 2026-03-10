const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/upload-controller')


// =========================


// Inital Upload Page Loads 
router.get('/', uploadController.renderUploadPage)
// Upload Page Handel Route
router.post('/', uploadController.renderUploadPage_Mongo)





// =========================

module.exports = router