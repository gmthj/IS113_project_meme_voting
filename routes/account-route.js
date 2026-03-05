const express = require('express')
const router = express.Router()

// =========================


// /account
router.get('/', (req, res) => {
    res.render('login', {})
})

// /account/login
router.get('/login', (req, res) => {
    // do login stuff
    
    res.render('login', {})
})

// /account/register
router.get('/register', (req, res) => {
    // do register/edit account stuff
    // go to home once done
    
    res.render('login', {})
})





// =========================

module.exports = router