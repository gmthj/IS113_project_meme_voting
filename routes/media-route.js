const express = require('express')
const router = express.Router()
const mediaController = require('../controllers/media-controller')

// =========================


// /media/images/:imageId
router.get("/images/:imageId", mediaController.getImage);


// =========================

module.exports = router