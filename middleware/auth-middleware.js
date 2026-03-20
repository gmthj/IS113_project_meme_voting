

exports.isLoggedIn = (req, res, next) => {
<<<<<<< HEAD
    if (!req.session.user) {
        console.log("User not logged in, redirecting to /login");
        return res.redirect('/account/login');
=======
    // console.log("isloggedin")
    // console.log(req.session)
    if (!req.session.sessionUser) {
        console.log("isLoggedIn - User not logged in, redirecting to /login (temp redirect to home, unitl loginreg done)");
        // return res.redirect('/account/login');
        return res.redirect('/home'); // TODO: switch to login when login ready
    }
    next();
}


exports.isAuthor = (req, res, next) => {
    if (!req.session.sessionUser) {
        console.log("isAuthor - User not logged in, redirecting to /login (temp redirect to home, unitl loginreg done)");
        // return res.redirect('/account/login');
        return res.redirect('/home'); // TODO: switch to login when login ready
    }
    if (req.session.sessionUser._id !== req.body.authorId) {
        console.log("isAuthor - unauthorised user not author");
        
        const backURL = req.get('Referrer') || '/';
        return res.redirect(backURL);
>>>>>>> 112a76e8974af3150b5001d8f1f701e962e1a5a8
    }
    next();
}

// exports.isAdmin = (req, res, next) => {
//     if (!req.session.user) {
//         console.log("User not logged in, redirecting to /login");
//         return res.redirect('/account/login');
//     }
//     if (req.session.user.role !== "admin") {
//         console.log("Not an admin user, redirecting to /profile");
//         return res.redirect('/profile');
//     }
//     next();
// }