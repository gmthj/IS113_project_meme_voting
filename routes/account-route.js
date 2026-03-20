const express = require('express')
const router = express.Router()
const accountController = require('../controllers/account-controller')

// =========================


// /account
router.get('/', accountController.renderLoginRoot)
 
// /account/login
router.get('/login', accountController.renderLogin)
router.post('/login', accountController.handleLogin)
 
// /account/register
<<<<<<< HEAD
router.get('/register', accountController.handleRegister)

=======
router.get('/register', accountController.renderRegister)
router.post('/register', accountController.handleRegister)
>>>>>>> 112a76e8974af3150b5001d8f1f701e962e1a5a8
// /account/logout
router.get('/logout', accountController.handleLogout)



// =========================

module.exports = router