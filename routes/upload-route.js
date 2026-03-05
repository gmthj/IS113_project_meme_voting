const express = require('express')
const router = express.Router()

// =========================


// /upload
router.get('/', (req, res) => {
    res.render('upload', {})
})





// =========================

module.exports = router