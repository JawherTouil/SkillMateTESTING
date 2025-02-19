const User = require('../models/User');
const bcrypt = require('bcryptjs');
const twilio = require('twilio');

// Initialize Twilio client only if credentials are available
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    console.log('Initializing Twilio with:', {
        accountSid: `${process.env.TWILIO_ACCOUNT_SID.substring(0, 6)}...`,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
    });
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
    console.log('Missing Twilio credentials');
}

const userController = {
    add: async (req, res) => {
        try {
            const user = new User(req.body);
            await user.save();
            res.status(200).json({ message: "User added successfully", user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Handle errors in non-async/await syntax
    updateAlt: (req, res) => {
        User.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json({ error: "User not found" });
                }
                res.status(200).json(updatedUser);
            })
            .catch(error => {
                res.status(500).json({ error: error.message });
            });
    }
    ,

    remove: async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Check if account is deactivated
            if (user.status === 'deactivated') {
                return res.status(403).json({ 
                    message: 'Account is deactivated. Please reactivate it using your phone number.',
                    deactivated: true,
                    userId: user._id 
                });
            }

            // Send user data without sensitive information
            const userData = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                status: user.status
            };

            res.json({ user: userData });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deactivate: async (req, res) => {
        try {
            const { userId, phoneNumber } = req.body;
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!phoneNumber) {
                return res.status(400).json({ message: 'Phone number is required for account deactivation' });
            }

            // Update phone number and status
            user.phoneNumber = phoneNumber;
            user.status = 'deactivated';
            await user.save();

            res.json({ message: 'Account deactivated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    reactivateWithPhone: async (req, res) => {
        try {
            const { phoneNumber, userId } = req.body;
            console.log('Attempting reactivation for:', { userId, phoneNumber });
            
            const user = await User.findById(userId);

            if (!user) {
                console.log('User not found:', userId);
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.phoneNumber !== phoneNumber) {
                console.log('Phone number mismatch:', {
                    provided: phoneNumber,
                    stored: user.phoneNumber
                });
                return res.status(400).json({ message: 'Phone number does not match our records' });
            }

            // Generate 6-digit verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Save code and expiration time
            user.verificationCode = verificationCode;
            user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await user.save();

            // Check if Twilio is configured
            if (!twilioClient) {
                console.log('Twilio not configured - Development mode');
                console.log('Development mode - Verification code:', verificationCode);
                return res.json({ 
                    message: 'Development mode: Check server console for verification code',
                    devCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
                });
            }

            console.log('Attempting to send SMS to:', phoneNumber);
            
            // Send SMS
            try {
                const message = await twilioClient.messages.create({
                    body: `Your SkillMate verification code is: ${verificationCode}. Valid for 10 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });
                
                console.log('SMS sent successfully:', {
                    messageId: message.sid,
                    status: message.status
                });
                
                res.json({ message: 'Verification code sent successfully' });
            } catch (twilioError) {
                console.error('Twilio Error:', {
                    code: twilioError.code,
                    message: twilioError.message,
                    moreInfo: twilioError.moreInfo
                });
                
                res.status(500).json({ 
                    message: 'Failed to send SMS. Please check your phone number format or try again later.',
                    error: twilioError.message
                });
            }
        } catch (error) {
            console.error('Reactivation error:', error);
            res.status(500).json({ 
                message: 'Failed to send verification code. Please ensure Twilio credentials are properly configured.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },
//aa
    verifyAndReactivate: async (req, res) => {
        try {
            const { userId, verificationCode } = req.body;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!user.verificationCode || !user.verificationCodeExpires) {
                return res.status(400).json({ message: 'No verification code requested' });
            }

            if (Date.now() > user.verificationCodeExpires) {
                return res.status(400).json({ message: 'Verification code expired' });
            }

            if (user.verificationCode !== verificationCode) {
                return res.status(400).json({ message: 'Invalid verification code' });
            }

            user.status = 'active';
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();

            const userData = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                status: user.status
            };

            res.json({ user: userData, message: 'Account reactivated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController;
