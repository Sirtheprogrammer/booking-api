const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const emailService = require('../services/emailService');
const config = require('../config');

// @desc    Register user and send OTP
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });

    if (userExists) {
        if (userExists.verified) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or phone number'
            });
        }

        // If user exists but not verified, regenerate OTP
        const otp = userExists.generateOTP();
        await userExists.save();

        // Send OTP via email
        await emailService.sendOTP(email, otp, name);

        return res.status(200).json({
            success: true,
            message: 'OTP resent successfully. Please check your email.',
            data: {
                email: userExists.email,
                expiresIn: `${config.otp.expireMinutes} minutes`
            }
        });
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        phone,
        password
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via email
    try {
        await emailService.sendOTP(email, otp, name);
    } catch (error) {
        // If email fails, delete the user
        await User.findByIdAndDelete(user._id);
        throw new Error('Failed to send verification email. Please try again.');
    }

    res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email for OTP.',
        data: {
            email: user.email,
            expiresIn: `${config.otp.expireMinutes} minutes`
        }
    });
});

// @desc    Verify OTP and activate account
// @route   POST /api/v1/auth/verify
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user.verified) {
        return res.status(400).json({
            success: false,
            message: 'Account already verified. Please login.'
        });
    }

    // Check if OTP exists
    if (!user.otp || !user.otp.code) {
        return res.status(400).json({
            success: false,
            message: 'No OTP found. Please request a new one.'
        });
    }

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
        return res.status(400).json({
            success: false,
            message: 'OTP has expired. Please request a new one.'
        });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
        return res.status(400).json({
            success: false,
            message: 'Invalid OTP'
        });
    }

    // Mark user as verified and clear OTP
    user.verified = true;
    user.otp = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Account verified successfully!',
        data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        }
    });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if user is verified
    if (!user.verified) {
        return res.status(401).json({
            success: false,
            message: 'Please verify your account first. Check your email for OTP.'
        });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Login successful!',
        data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        }
    });
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                verified: user.verified
            }
        }
    });
});

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
exports.resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (user.verified) {
        return res.status(400).json({
            success: false,
            message: 'Account already verified'
        });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via email
    await emailService.sendOTP(email, otp, user.name);

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully. Please check your email.',
        data: {
            expiresIn: `${config.otp.expireMinutes} minutes`
        }
    });
});
