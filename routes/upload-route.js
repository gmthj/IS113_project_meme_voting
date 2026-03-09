const express = require('express')
const router = express.Router()
const uploadController = require('../controllers/upload-controller')


// =========================


// /upload
router.get('/', uploadController.renderUploadPage)
router.post('/', uploadController.renderUploadPage_Mongo)





// =========================

module.exports = router