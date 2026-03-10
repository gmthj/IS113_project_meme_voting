exports.renderLoginRoot = (req, res) => {
    res.render('login', {})
}

// /account/login

exports.handleLogin = async (req, res) => {
    // do login stuff
    
    const User = require("../models/User-model");
    await connectDB();
    let username = req.body.user_id
    let password = req.body.password
    let email = req.body.email
    const userA = await User.findOne({ email: email });
    if (!userA) {
        console.log( `${email} not found`);
        await mongoose.disconnect();
        process.exit(0);
    } else {
        if (userA.passwordHash === password) {
            if (userA.username === username) {
                if (userA.email === email) {
                    console.log( `${username} logged in successfully`);
                    req.session.user = {
                        id: userA._id,
                        username: userA.username,
                        email: userA.email,
                    };
                    await mongoose.disconnect();
                    return res.redirect('/home');
                }
        } else {
            console.log( `${password} wrong`);
            await mongoose.disconnect();
            process.exit(0);
        }
    }




    // res.render('login', {})
}

// /account/register
exports.handleRegister = (req, res) => {
    // do register/edit account stuff
    // go to home once done
    
    res.render('login', {})
}


// /account/logout
exports.handleLogout = (req, res) => {
    req.session.destroy(() => {
       res.redirect('/home');
   });
}