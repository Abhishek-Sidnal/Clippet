const bcrypt = require("bcryptjs");
const HttpError = require("../models/errorModel");
const User = require("../models/userModel");

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, profession } = req.body;

        if (!name || !email || !password || !phone || !profession) {
            return next(new HttpError("Fill the all details.", 422));
        }
        const newEmail = email.toLowerCase();

        const emailExist = await User.findOne({ email: newEmail });
        if (emailExist) {
            return next(new HttpError("Email already exists.", 422));
        }

        if (password.trim().length < 6) {
            return next(new HttpError("Password should be at least 6 characters.", 422));
        }
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email: newEmail, password: hashPass, phone, profession });
        res.status(201).json(`${newUser.email} registered`);
    } catch (error) {
        return next(new HttpError("User Registration failed", 500));
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new HttpError("Fill in all details.", 422));
        }
        const newEmail = email.toLowerCase();

        const user = await User.findOne({ email: newEmail });
        if (!user) {
            return next(new HttpError("Invalid Credentials.", 422));
        }
        const comparePass = await bcrypt.compare(password, user.password);
        if (!comparePass) {
            return next(new HttpError("Invalid Credentials.", 422));
        }
        const { name, phone, profession } = user;
        res.status(200).json({ name, phone, profession, email: user.email, id: user._id });
    } catch (error) {
        return next(new HttpError("Login failed", 500));
    }
};

const editUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, currentPassword, newPassword, confirmPassword, phone, profession } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        if (currentPassword) {
            const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordCorrect) {
                return next(new HttpError("Current password is incorrect.", 422));
            }

            if (newPassword) {
                if (newPassword.trim().length < 6) {
                    return next(new HttpError("New password should be at least 6 characters.", 422));
                }
                if (newPassword !== confirmPassword) {
                    return next(new HttpError("New password and confirm password do not match.", 422));
                }

                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(newPassword, salt);
            }
        } else if (newPassword || confirmPassword) {
            return next(new HttpError("Current password is required to set a new password.", 422));
        }

        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (phone) user.phone = phone;
        if (profession) user.profession = profession;

        await user.save();

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        return next(new HttpError("User update failed", 500));
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return next(new HttpError("Invalid user ID.", 400));
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error.message);
        return next(new HttpError("User deletion failed", 500));
    }
};



const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords from the result

        if (!users || users.length === 0) {
            return next(new HttpError("No users found.", 404));
        }

        res.status(200).json({ users });
    } catch (error) {
        return next(new HttpError("Fetching users failed", 500));
    }
};

module.exports = { registerUser, loginUser, editUser, deleteUser, getAllUsers };
