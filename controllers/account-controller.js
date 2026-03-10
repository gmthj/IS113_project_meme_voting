exports.renderLoginRoot = (req, res) => {
    res.render('login', {})
}

// /account/login
exports.handleLogin = (req, res) => {
    // do login stuff
    let username = req.body.user_id
    let password = req.body.password
    
    res.render('login', {})
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