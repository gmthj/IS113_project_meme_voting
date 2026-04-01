const User = require('../models/User-model');
const { deleteUserById } = require('../services/userService');

const bcrypt = require('bcrypt');

const { avatarFor } = require("../utils/utils");
const {
    MIN_AGE,
    PW_MIN_LENGTH,
    PW_REQUIRE_UPPER,
    PW_REQUIRE_LOWER,
    PW_REQUIRE_NUMBER,
    PW_REQUIRE_SPECIAL
} = require("../config");


// Helper: calculate age from a Date
function getAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}
function isValidPassword(password) {
    const errors = [];
    if (password.length < PW_MIN_LENGTH) {
        errors.push(`Password must be at least ${PW_MIN_LENGTH} characters.`);
    }

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';

    let hasUpper = (false || !PW_REQUIRE_UPPER);
    let hasLower = (false || !PW_REQUIRE_LOWER);
    let hasNumber = (false || !PW_REQUIRE_NUMBER);
    let hasSpecial = (false || !PW_REQUIRE_SPECIAL);

    for (const char of password) {
        if (uppercase.includes(char)) hasUpper = true;
        if (lowercase.includes(char)) hasLower = true;
        if (numbers.includes(char)) hasNumber = true;
        if (special.includes(char)) hasSpecial = true;
    }

    if (!hasUpper) errors.push('Password must contain at least one uppercase letter.');
    if (!hasLower) errors.push('Password must contain at least one lowercase letter.');
    if (!hasNumber) errors.push('Password must contain at least one number.');
    if (!hasSpecial) errors.push('Password must contain at least one special character.');

    return errors.length > 0 ? errors : null;
}
function isValidEmail(email) {
    const atIndex = email.indexOf('@');
    if (atIndex <= 0) return false;
    if (email.indexOf('@', atIndex + 1) !== -1) return false;

    const domain = email.slice(atIndex + 1);
    const dotIndex = domain.lastIndexOf('.');
    if (dotIndex <= 0) return false;
    if (dotIndex === domain.length - 1) return false;
    const tld = domain.slice(dotIndex + 1);
    if (tld.length < 2) return false;

    return true;
}
exports.renderLoginRoot = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    res.render('login', { sessionUser, error: null });
};

// /account/login
exports.renderLogin = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    res.render('login', { sessionUser, error: null });
};

exports.handleLogin = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.render('login', { sessionUser, error: 'Please fill in all fields.' });
    }

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.render('login', { sessionUser, error: 'Invalid email or password.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            return res.render('login', { sessionUser, error: 'Invalid email or password.' });
        }

        req.session.sessionUser = user;
        return res.redirect('/home');

    } catch (err) {
        console.error('Login error:', err);
        return res.render('login', { sessionUser, error: 'Something went wrong. Please try again.' });
    }
};

exports.renderRegister = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    res.render('register', { sessionUser, error: null, formData: {}, MIN_AGE });
};

// /account/register
exports.handleRegister = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const { email, password, confirmation, name, dob, bio } = req.body;
    const formData = { email, name, dob, bio };

    try {

        const errors = [];

        if (!email || !password || !confirmation || !name || !dob) {
            errors.push('Please fill in all required fields.');
        }

        if (password && confirmation && password !== confirmation) {
            errors.push('Passwords do not match.');
        }
        if (email && !isValidEmail(email.trim())) {
            errors.push('Please enter a valid email address (e.g. name@example.com).');
        }
        if (password) {
            const passwordError = isValidPassword(password);
            if (passwordError) {
                errors.push(...passwordError); //extend
            }
        }

        if (dob) {
            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) {
                errors.push('Invalid date of birth.');
            } else if (dobDate > new Date() || getAge(dobDate) > 100) {
                errors.push('Please enter valid date of birth.');
            } else if (getAge(dobDate) < MIN_AGE) {
                errors.push(`You must be at least ${MIN_AGE} years old to register.`);
            }
        }

        if (email) {
            const existing = await User.findOne({ email: email.trim().toLowerCase() });
            if (existing) {
                errors.push('An account with that email already exists.');
            }
        }

        if (errors.length > 0) {
            return res.render('register', { sessionUser, error: errors, formData, MIN_AGE });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            email: email.trim().toLowerCase(),
            passwordHash,
            name: name.trim(),
            dob: dobDate,
            bio: bio ? bio.trim() : '',
            avatar: avatarFor(email),
        });

        await newUser.save();

        req.session.sessionUser = newUser;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('register', { sessionUser, error: 'Something went wrong. Please try again.', formData, MIN_AGE });
            }
            return res.redirect('/home');
        });

    } catch (err) {
        console.error('Registration error:', err);
        return res.render('register', { sessionUser, error: 'Something went wrong. Please try again.', formData, MIN_AGE });
    }
};

// /account/logout
exports.handleLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/home');
    });
};

//delete user
exports.handleDeleteAccount = async (req, res) => {
    const sessionUser = req.session.sessionUser;

    try {
        await deleteUserById(sessionUser._id);

        req.session.destroy(() => {
            res.redirect('/home');
        });
    } catch (err) {
        console.error('Error deleting account:', err);
        return res.render('error', { sessionUser, error: 'Something went wrong. Please try again.' });
    }
};

// /account/edit
exports.renderEdit = (req, res) => {
    const sessionUser = req.session.sessionUser;

    res.render('edit-account', { //prefills the form with current name and bio
        sessionUser,
        error: null,
        formData: {
            name: sessionUser.name,
            bio: sessionUser.bio,
        }
    });
};

exports.handleEdit = async (req, res) => {
    const sessionUser = req.session.sessionUser;

    const name = req.body.name;
    const bio = req.body.bio;
    const formData = { name, bio };

    if (!name) {
        return res.render('edit-account', { sessionUser, error: 'Name cannot be empty.', formData });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            sessionUser._id,
            { name: name.trim(), bio: bio ? bio.trim() : '' },
            { new: true }
        );

        req.session.sessionUser = updatedUser;
        return res.redirect('/home');

    } catch (err) {
        console.error('Edit account error:', err);
        return res.render('edit-account', { sessionUser, error: 'Something went wrong. Please try again.', formData });
    }
};


// Change Password in the User Account Page
exports.changepassword = (req, res) => {
    const sessionUser = req.session.sessionUser;

    res.render("changePassword", {
        sessionUser,
        error: null,
        success: null,
        formData: {}
    });
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const sessionUser = req.session.sessionUser;
    const formData = {};

    try {
        const errors = [];

        if (!currentPassword || !newPassword || !confirmPassword) {
            errors.push("All fields are required");
        }

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            errors.push("Passwords do not match");
        }

        if (newPassword) {
            const passwordError = isValidPassword(newPassword);
            if (passwordError) {
                errors.push(...passwordError);
            }
        }

        let user = null;
        if (currentPassword) {
            user = await User.findById(sessionUser._id);
            const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                errors.push("Current password incorrect");
            }
        }

        if (currentPassword && newPassword && currentPassword === newPassword) {
            errors.push("New password cannot be the same as current password");
        }

        if (errors.length > 0) {
            return res.render("changePassword", {
                sessionUser,
                error: errors,
                success: null,
                formData
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newHash;
        await user.save();

        return res.render("changePassword", {
            sessionUser,
            error: null,
            success: "Password updated successfully",
            formData: {}
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.render("changePassword", {
            sessionUser,
            error: "Something went wrong. Please try again.",
            success: null,
            formData
        });
    }
};


// Forget password at the login page
exports.forgetPasswordPage = (req, res) => {

    res.render("forgetPassword", {
        sessionUser: {},
        error: null,
        success: null,
        formData: {}
    });
};

// Handle form submit
exports.forgetPassword = async (req, res) => {
    try {
        const { email, dob, newPassword, confirmPassword } = req.body;
        const formData = { email, dob };
        const errors = [];

        if (!email || !dob || !newPassword || !confirmPassword) {
            errors.push("All fields are required");
        }

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            errors.push("Passwords do not match");
        }

        if (email && !isValidEmail(email.trim())) {
            errors.push("Please enter a valid email address (e.g. name@example.com).");
        }

        if (newPassword) {
            const passwordError = isValidPassword(newPassword);
            if (passwordError) {
                errors.push(...passwordError);
            }
        }

        let user = null;
        if (email && isValidEmail(email.trim())) {
            user = await User.findOne({ email: email.trim().toLowerCase() });
            if (!user) {
                errors.push("User not found");
            }
        }

        let inputDobValid = false;
        if (dob) {
            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) {
                errors.push("Invalid date of birth format.");
            } else {
                inputDobValid = true;
            }
        }

        if (inputDobValid && user && user.dob) {
            const inputDobStr = new Date(dob).toISOString().split("T")[0];
            const userDobStr = new Date(user.dob).toISOString().split("T")[0];

            if (inputDobStr !== userDobStr) {
                errors.push("Email and date of birth do not match");
            }
        }

        if (newPassword && user) {
            const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
            if (isSameAsOld) {
                errors.push("New password cannot be the same as current password");
            }
        }

        if (errors.length > 0) {
            return res.render("forgetPassword", {
                sessionUser: {},
                error: errors,
                success: null,
                formData
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newHash;
        await user.save();

        return res.render("forgetPassword", {
            sessionUser: {},
            error: null,
            success: "Password updated successfully. Redirecting to login in 3s",
            formData: {}
        });
    } catch (error) {
        console.error("Forget password error:", error);
        return res.render("forgetPassword", {
            sessionUser: {},
            error: "Something went wrong. Please try again.",
            success: null,
            formData: {}
        });
    }
};

