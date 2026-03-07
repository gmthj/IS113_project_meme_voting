const express = require('express')
const router = express.Router()
const deleteController = require('../controllers/delete-controller')

// =========================


// /delete
router.get('/', deleteController.handleDeletion)





// =========================

module.exports = router