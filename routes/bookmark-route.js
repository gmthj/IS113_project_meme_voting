const express = require('express')
const router = express.Router()
const bookmarkController = require('../controllers/bookmark-controller')
const authMiddleware = require('../middleware/auth-middleware')

// =========================


// /bookamrk
router.post('/', authMiddleware.isLoggedIn, bookmarkController.hellokinyu)
 



// =========================

module.exports = router