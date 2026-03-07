const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')

// =========================


// /user
router.get('/', userController.renderUserProfile)






// =========================

module.exports = router