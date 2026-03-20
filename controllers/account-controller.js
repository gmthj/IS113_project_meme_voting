const MIN_AGE = 13;

// Helper: calculate age from a Date
function getAge(dob) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

exports.renderLoginRoot = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    res.render('login', { sessionUser });
};

// /account/login
exports.renderLogin = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    res.render('login', { sessionUser, error: null });
};

exports.handleLogin = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const { email, password } = req.body;

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

    if (password.length < 6) {
        return res.render('register', { sessionUser, error: 'Password must be at least 6 characters.', formData });
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
            avatar: '',
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
