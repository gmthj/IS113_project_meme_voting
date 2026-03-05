const express = require('express')
const router = express.Router()


router.get("/", (req, res) => {
  res.redirect("/home")
})



const homeRoute = require('./home-route')
router.use('/home', homeRoute)

const accountRoute = require('./account-route')
router.use('/account', accountRoute)

const userRoute = require('./user-route')
router.use('/user', userRoute)

const uploadRoute = require('./upload-route')
router.use('/upload', uploadRoute)

const fullpostRoute = require('./fullpost-route')
router.use('/fullpost', fullpostRoute)

const deleteRoute = require('./delete-route')
router.use('/delete', deleteRoute)

const voteRoute = require('./vote-route')
router.use('/vote', voteRoute)





module.exports = router