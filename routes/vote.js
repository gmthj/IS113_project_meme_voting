const express = require('express')
const router = express.Router()

// =========================


// /vote
router.get('/', (req, res) => {

    // voting
    // 
    // go back to origin page - fullpost user home
    res.redirect('vote')
})





// =========================

module.exports = router