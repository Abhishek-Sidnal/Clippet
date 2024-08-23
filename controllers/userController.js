const bcrypt = require("bcryptjs");
const HttpError = require("../models/errorModel");
const User = require("../models/userModel");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, profession } = req.body;

        if (!name || !email || !password || !phone || !profession) {
            req.flash("error", "Please fill in all details.");
            return res.redirect("/signup");
        }

        const newEmail = email.toLowerCase();
        const emailExist = await User.findOne({ email: newEmail });

        if (emailExist) {
            req.flash("error", "Email already exists.");
            return res.redirect("/signup");
        }

        if (password.trim().length < 6) {
            req.flash("error", "Password should be at least 6 characters.");
            return res.redirect("/signup");
        }

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email: newEmail, password: hashPass, phone, profession });

        req.flash("success", `${newUser.email} registered successfully.`);
        res.redirect("/login");
    } catch (error) {
        req.flash("error", "User registration failed.");
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash("error", "Please fill in all details.");
            return res.redirect("/login");
        }

        const newEmail = email.toLowerCase();
        const user = await User.findOne({ email: newEmail });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            req.flash("error", "Invalid credentials.");
            return res.redirect("/login");
        }

        req.session.userId = user._id; // Assuming you're using sessions
        req.flash("success", `Welcome back, ${user.name}!`);
        res.redirect("/home");
    } catch (error) {
        req.flash("error", "Login failed.");
        res.redirect("/login");
    }
};

module.exports.renderEditUserForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        res.render("users/edit", { user });
    } catch (error) {
        req.flash("error", "Failed to load edit form.");
        res.redirect("/home");
    }
};

module.exports.editUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, currentPassword, newPassword, confirmPassword, phone, profession } = req.body;

        const user = await User.findById(id);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        if (currentPassword) {
            const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordCorrect) {
                req.flash("error", "Current password is incorrect.");
                return res.redirect(`/users/edit/${id}`);
            }

            if (newPassword) {
                if (newPassword.trim().length < 6) {
                    req.flash("error", "New password should be at least 6 characters.");
                    return res.redirect(`/users/edit/${id}`);
                }

                if (newPassword !== confirmPassword) {
                    req.flash("error", "New password and confirm password do not match.");
                    return res.redirect(`/users/edit/${id}`);
                }

                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(newPassword, salt);
            }
        } else if (newPassword || confirmPassword) {
            req.flash("error", "Current password is required to set a new password.");
            return res.redirect(`/users/edit/${id}`);
        }

        user.name = name || user.name;
        user.email = email ? email.toLowerCase() : user.email;
        user.phone = phone || user.phone;
        user.profession = profession || user.profession;

        await user.save();

        req.flash("success", "User updated successfully.");
        res.redirect("/home");
    } catch (error) {
        req.flash("error", "User update failed.");
        res.redirect("/home");
    }
};

module.exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            req.flash("error", "Invalid user ID.");
            return res.redirect("/home");
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/home");
        }

        // Check if any users remain in the database
        const remainingUsers = await User.countDocuments({});
        if (remainingUsers === 0) {
            req.flash("info", "All users have been deleted. Please register a new user.");
            return res.redirect("/signup");
        }

        req.flash("success", "User deleted successfully.");
        res.redirect("/home");
    } catch (error) {
        req.flash("error", "User deletion failed.");
        res.redirect("/home");
    }
};

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords from the result

        res.render("users/home", { users });
    } catch (error) {
        req.flash("error", "Fetching users failed.");
        res.render("users/home", { users: [] });
    }
};
