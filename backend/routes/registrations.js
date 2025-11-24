const express = require('express');
const { body, validationResult } = require('express-validator');
const { dbQueries } = require('../database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Submit registration (public - from website form)
router.post('/submit',
    [
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
        body('address').trim().notEmpty().withMessage('Address is required'),
        body('kitChoice').notEmpty().withMessage('Kit choice is required')
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

            const { fullName, email, phone, dateOfBirth, address, kitChoice } = req.body;

            const result = dbQueries.createRegistration.run(
                fullName,
                email,
                phone,
                dateOfBirth,
                address,
                kitChoice
            );

            res.status(201).json({
                success: true,
                message: 'Registration submitted successfully! We will contact you shortly with payment instructions.',
                registrationId: result.lastInsertRowid
            });
        } catch (error) {
            console.error('Registration submission error:', error);
            res.status(500).json({
                success: false,
                message: 'Error submitting registration'
            });
        }
    }
);

// Get all registrations (admin only)
router.get('/', authenticateToken, isAdmin, (req, res) => {
    try {
        const registrations = dbQueries.getAllRegistrations.all();
        res.json({
            success: true,
            count: registrations.length,
            registrations
        });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registrations'
        });
    }
});

// Get registration by ID (admin only)
router.get('/:id', authenticateToken, isAdmin, (req, res) => {
    try {
        const registration = dbQueries.getRegistrationById.get(req.params.id);
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            registration
        });
    } catch (error) {
        console.error('Get registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registration'
        });
    }
});

// Update registration status (admin only)
router.patch('/:id/status', authenticateToken, isAdmin,
    [
        body('status').isIn(['pending', 'contacted', 'paid', 'completed', 'cancelled']).withMessage('Invalid status'),
        body('paymentConfirmed').isBoolean().optional(),
        body('notes').optional()
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

            const { status, paymentConfirmed, notes } = req.body;

            dbQueries.updateRegistrationStatus.run(
                status,
                paymentConfirmed ? 1 : 0,
                notes || null,
                req.params.id
            );

            res.json({
                success: true,
                message: 'Registration status updated successfully'
            });
        } catch (error) {
            console.error('Update registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating registration'
            });
        }
    }
);

module.exports = router;
