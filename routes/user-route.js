const express = require('express')
const router = express.Router()

// =========================


// /user
router.get('/', (req, res) => {
    res.render('user', {})
})






// =========================

module.exports = router