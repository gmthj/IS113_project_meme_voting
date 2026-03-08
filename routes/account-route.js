const express = require('express')
const router = express.Router()
const accountController = require('../controllers/account-controller')

// =========================


// /account
router.get('/', accountController.renderLoginRoot)

// /account/login
router.get('/login', accountController.handleLogin)

// /account/register
router.get('/register', accountController.handleRegister)

// /account/logout
router.get('/logout', accountController.handleLogout)



// =========================

module.exports = router