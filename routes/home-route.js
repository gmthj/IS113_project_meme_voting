const express = require('express')
const router = express.Router()

// =========================


// /home
router.get('/', (req, res) => {
    // sort/filter posts
    res.render('home', {})
})




// =========================

module.exports = router