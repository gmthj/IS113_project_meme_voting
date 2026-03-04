const express = require('express')
const router = express.Router()

// =========================


// /account
router.get('/', (req, res) => {
    res.render('login', {})
})

// /account/login
router.post('/login', (req, res) => {
    // do login stuff
})

// /account/register
router.post('/register', (req, res) => {
    // do register/edit account stuff
    // go to home once done
})





// =========================

module.exports = router