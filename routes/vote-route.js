const express = require('express')
const router = express.Router()

// =========================

const { getUserByEmail } = require("../services/userService");

// /vote
router.get('/', async (req, res) => {
    
    // getUserByEmail("seesd@smu.edu.sg")
    // .then((user) => {
    //     console.log(user)
    // })
    // .catch((error) => {
    //     console.log("helo", error)
    // });
    try{
        const user = await getUserByEmail("seed@smu.edu.sg");
        
        console.log(user)
    }
    catch (error) {

        console.log(error)
    }

    
    // voting
    // 
    // go back to origin page - fullpost user home
    res.redirect('/home')

})





// =========================

module.exports = router