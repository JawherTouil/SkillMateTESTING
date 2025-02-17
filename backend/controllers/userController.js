const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Successful login
        res.status(200).json({ message: "Login successful", user: { id: user._id, username: user.username, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function add(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(200).send("User added successfully");
    } catch (error) {
      res.status(400).send({ error: error.toString() });
    }
}

async function getAll(req, res) {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function getById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function update(req, res) {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(updatedUser);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}


async function remove(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}
async function searchByUsername(req, res) {
    try {
        const users = await User.find({ username: new RegExp(req.params.username, 'i') });
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

// Generate a random 6-digit reset code
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

/** 📩 Step 1: Send Reset Code */
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User with this email does not exist.');
        }

        // Generate & store reset code
        const resetCode = generateResetCode();
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 min expiry
        await user.save();

        // Send code via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${resetCode}\nThis code is valid for 15 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset code sent to your email.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).send('Failed to process your request.');
    }
};

/** 🔍 Step 2: Verify Reset Code */
const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.resetCode !== code) {
            return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
        }

        // Check if code has expired
        if (user.resetCodeExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Reset code expired.' });
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Code verification error:', error);
        res.status(500).json({ message: 'Error verifying reset code.' });
    }
};

/** 🔐 Step 3: Reset Password */
const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User with this email does not exist.');
        }

        // Validate code
        if (user.resetCode !== resetCode || user.resetCodeExpires < Date.now()) {
            return res.status(400).send('Invalid or expired reset code.');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();

        res.status(200).send('Password successfully reset!');

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).send('Error resetting password.');
    }
};

/** 👤 Login Logic (Unchanged) */
async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {add,remove,update,getAll,getById,searchByUsername,login,forgotPassword,resetPassword,verifyResetCode,login};

