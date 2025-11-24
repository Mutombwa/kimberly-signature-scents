const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { userDB } = require('../database-postgres');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register',
    [
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
        body('kitChoice').notEmpty().withMessage('Kit choice is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { fullName, email, password, phone, dateOfBirth, address, kitChoice } = req.body;

            // Check if user already exists
            const existingUser = dbQueries.getUserByEmail.get(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const result = dbQueries.createUser.run(
                fullName,
                email,
                hashedPassword,
                phone,
                dateOfBirth,
                address,
                kitChoice
            );

            // Generate token
            const token = generateToken({
                id: result.lastInsertRowid,
                email: email,
                role: 'user'
            });

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                token,
                user: {
                    id: result.lastInsertRowid,
                    fullName,
                    email
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating account'
            });
        }
    }
);

// Login
router.post('/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Get user
            const user = dbQueries.getUserByEmail.get(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if account is active
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    message: 'Account has been deactivated'
                });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Update last login
            dbQueries.updateLastLogin.run(user.id);

            // Generate token
            const token = generateToken({
                id: user.id,
                email: user.email,
                role: user.role
            });

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profile_image
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error logging in'
            });
        }
    }
);

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = dbQueries.getUserById.get(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

module.exports = router;
