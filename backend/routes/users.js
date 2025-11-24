const express = require('express');
const { body, validationResult } = require('express-validator');
const { dbQueries } = require('../database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user profile (requires authentication)
router.get('/profile/:id', authenticateToken, (req, res) => {
    try {
        const user = dbQueries.getUserById.get(req.params.id);
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
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
});

// Update own profile
router.put('/profile', authenticateToken,
    [
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('phone').trim().notEmpty().withMessage('Phone is required'),
        body('bio').optional().trim()
    ],
    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { fullName, phone, bio, profileImage } = req.body;

            dbQueries.updateUserProfile.run(
                fullName,
                phone,
                bio || null,
                profileImage || null,
                req.user.id
            );

            res.json({
                success: true,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating profile'
            });
        }
    }
);

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, (req, res) => {
    try {
        const users = dbQueries.getAllUsers.all();

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Get statistics
router.get('/stats', (req, res) => {
    try {
        const stats = dbQueries.getStats.get();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;
