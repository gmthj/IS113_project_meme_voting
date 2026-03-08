

exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        console.log("User not logged in, redirecting to /login");
        return res.redirect('/account/login');
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