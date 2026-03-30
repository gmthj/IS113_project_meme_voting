const express = require('express')
const router = express.Router()
const accountController = require('../controllers/account-controller')
const authMiddleware = require('../middleware/auth-middleware')

// =========================

// /account
router.get('/', accountController.renderLoginRoot)
 
// /account/login
router.get('/login', accountController.renderLogin)
router.post('/login', accountController.handleLogin)
 
// /account/register
router.get('/register', accountController.renderRegister)
router.post('/register', accountController.handleRegister)

// /account/logout
router.get('/logout', accountController.handleLogout)

// /account/edit  (must be logged in)
router.get('/edit', authMiddleware.isLoggedIn, accountController.renderEdit)
router.post('/edit', authMiddleware.isLoggedIn, accountController.handleEdit)
// router.get('/edit', (req, res) => {
//   res.send('EDIT ROUTE HIT');
// }); 
// /account/delete  (must be logged in)
router.post('/delete', authMiddleware.isLoggedIn, accountController.handleDeleteAccount)
 



// =========================

module.exports = router