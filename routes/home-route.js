const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home-controller')

// =========================


// /home
router.get('/', homeController.renderHome)
router.post('/reset-sort', homeController.resetSort);



// =========================

module.exports = router