const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')

// =========================


// /user
router.get('/:userId', userController.renderUserProfile)






// =========================

module.exports = router