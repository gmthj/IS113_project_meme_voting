const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home-controller')

// =========================


// /home
router.get('/', homeController.renderHome)




// =========================

module.exports = router