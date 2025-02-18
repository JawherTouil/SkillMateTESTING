const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findOne({ _id: decoded.id });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if account is deactivated
        if (user.status === 'deactivated') {
            return res.status(403).json({ 
                message: 'Account is deactivated',
                deactivated: true
            });
        }

        // Add user to request
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid' });
    }
};

module.exports = auth;
