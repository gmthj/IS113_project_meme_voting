

exports.isLoggedIn = (req, res, next) => {
    // console.log("isloggedin")
    // console.log(req.session)
    if (!req.session.sessionUser) {
        console.log("User not logged in, redirecting to /login");
        // return res.redirect('/account/login');
        return res.redirect('/home'); // TODO: switch to login when login ready
    }
    next();
}


exports.isAuthor = (req, res, next) => {
    if (!req.session.sessionUser) {
        console.log("User not logged in, redirecting to /login");
        // return res.redirect('/account/login');
        return res.redirect('/home'); // TODO: switch to login when login ready
    }
    if (req.session.sessionUser._id !== req.body.authorId) {
        console.log("unauthorised user not author");
        
        const backURL = req.get('Referrer') || '/';
        return res.redirect(backURL);
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