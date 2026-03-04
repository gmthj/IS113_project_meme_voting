const express = require('express')
const router = express.Router()

// =========================


// /fullpost
router.get('/', (req, res) => {
    // get post data from db
    res.render('/fullpost.ejs', {})
})

// /fullpost/comment
router.post('/comment', (req, res) => {
    // upload comment
})





// =========================

module.exports = router