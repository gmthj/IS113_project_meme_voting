const User = require('../models/User-model');
const Post = require('../models/Post-model');
const Comment = require('../models/Comment-model');
const Vote = require('../models/Vote-model');
const Bookmark = require('../models/Bookmark-model');
const PostPreference = require('../models/Post-Preference-model');
const CommentPreference = require('../models/Comment-Preference-model');

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
 
// const MIN_AGE = 13;
 
// Helper: calculate age from a Date
function getAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}
function isValidPassword(password) {
    if (password.length < PW_MIN_LENGTH) {
        return `Password must be at least ${PW_MIN_LENGTH} characters.`;
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

    if (!hasUpper) return 'Password must contain at least one uppercase letter.';
    if (!hasLower) return 'Password must contain at least one lowercase letter.';
    if (!hasNumber) return 'Password must contain at least one number.';
    if (!hasSpecial) return 'Password must contain at least one special character.';

    return null;
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
    res.render('register', { sessionUser, error: null, formData: {} });
};
 
// /account/register
exports.handleRegister = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const { email, password, confirmation, name, dob, bio } = req.body;
    const formData = { email, name, dob, bio };
 
    if (!email || !password || !confirmation || !name || !dob) {
        return res.render('register', { sessionUser, error: 'Please fill in all required fields.', formData });
    }
 
    if (password !== confirmation) {
        return res.render('register', { sessionUser, error: 'Passwords do not match.', formData });
    }
 
    const passwordError = isValidPassword(password);
    if (passwordError) {
        return res.render('register', { sessionUser, error: passwordError, formData });
    }
 
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
        return res.render('register', { sessionUser, error: 'Invalid date of birth.', formData });
    }
 
    if (getAge(dobDate) < MIN_AGE) {
        return res.render('register', { sessionUser, error: `You must be at least ${MIN_AGE} years old to register.`, formData });
    }
 
    try {
        const existing = await User.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.render('register', { sessionUser, error: 'An account with that email already exists.', formData });
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
        return res.redirect('/home');
 
    } catch (err) {
        console.error('Registration error:', err);
        return res.render('register', { sessionUser, error: 'Something went wrong. Please try again.', formData });
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

    // if (!sessionUser) {
    //     return res.redirect('/account/login');
    // }
    
    try {

    const userPosts = await Post.find({ userId: sessionUser._id });

    for (const post of userPosts) {
        
        const comments = await Comment.find({ postId: post._id });

        for (const comment of comments) {
            await Vote.deleteMany({ commentId: comment._id }); 
        }

        await Comment.deleteMany({ postId: post._id });
        await Vote.deleteMany({ postId: post._id });
        await Bookmark.deleteMany({ postId: post._id });
        await CommentPreference.deleteMany({ postId: post._id });
        await Post.findByIdAndDelete(post._id);
    }

    const userComments = await Comment.find({ userId: sessionUser._id });

    for (const comment of userComments) {
    
    const parentPost = await Post.findById(comment.postId);
    
    if (parentPost) {
        parentPost.comment_count = parentPost.comment_count - 1; //Takes the current comment count and minus 1, since comment is about to be deleted
        await parentPost.save();
    }
    await Vote.deleteMany({ commentId: comment._id });
    }

    await Comment.deleteMany({ userId: sessionUser._id });
    const userVotes = await Vote.find({ userId: sessionUser._id });

    for (const vote of userVotes) {
        const scoreChange = vote.value ? -1 : 1;
        if (vote.postId) {
            const post = await Post.findById(vote.postId);
            if (post) {
                post.vote_score = post.vote_score + scoreChange;
                await post.save();
            }
        }
        if (vote.commentId) {
            const comment = await Comment.findById(vote.commentId);
            if (comment) {
                comment.vote_score = comment.vote_score + scoreChange;
                await comment.save();
            }
        }
    }
    // delete remaining user data
    await Vote.deleteMany({ userId: sessionUser._id });
    await Bookmark.deleteMany({ userId: sessionUser._id });
    await PostPreference.deleteMany({ userId: sessionUser._id });
    await CommentPreference.deleteMany({ userId: sessionUser._id });

    await User.findByIdAndDelete(sessionUser._id);

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
 
    // if (!sessionUser) {
    //     return res.redirect('/account/login');
    // }
 
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
 
    // if (!sessionUser) {
    //     return res.redirect('/account/login');
    // }
 
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
        success: null
    });
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const sessionUser = req.session.sessionUser;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.render("changePassword", {
            sessionUser,
            error: "All fields are required",
            success: null
        });
    }

    if (newPassword !== confirmPassword) {
        return res.render("changePassword", {
            sessionUser,
            error: "Passwords do not match",
            success: null
        });
    }

    const user = await User.findById(sessionUser._id);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
        return res.render("changePassword", {
            sessionUser,
            error: "Current password incorrect",
            success: null
        });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    return res.render("changePassword", {
        sessionUser,
        error:null,
        success: "Password updated successfully"
    });
};


// Forget password at the login page
exports.forgetPasswordPage = (req, res) => {

    res.render("forgetPassword", {
        error: null,
        success: null
    });
};

// Handle form submit
exports.forgetPassword = async (req, res) => {
    try {
        const { email, dob, newPassword, confirmPassword } = req.body;

        if (!email || !dob || !newPassword || !confirmPassword) {
            return res.render("forgetPassword", {
                error: "All fields are required",
                success: null
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render("forgetPassword", {
                error: "Passwords do not match",
                success: null
            });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.render("forgetPassword", {
                error: "User not found",
                success: null
            });
        }

        const inputDob = new Date(dob).toISOString().split("T")[0];
        const userDob = new Date(user.dob).toISOString().split("T")[0];

        if (inputDob !== userDob) {
            return res.render("forgetPassword", {
                error: "Email and date of birth do not match",
                success: null
            });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newHash;
        await user.save();

        return res.render("forgetPassword", {
            error: null,
            success: "Password updated successfully. Redirecting to login in 3s"
        });
    } catch (error) {
        console.error("Forget password error:", error);
        return res.render("forgetPassword", {
            error: "Something went wrong. Please try again.",
            success: null
        });
    }
};

