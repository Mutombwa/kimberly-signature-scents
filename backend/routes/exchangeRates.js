const express = require('express');
const router = express.Router();
const { dbQueries } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get current exchange rate (public)
router.get('/current', async (req, res) => {
    try {
        const rate = dbQueries.getCurrentExchangeRate.get();
        res.json({ rate: rate || { rate: 17.00, last_updated: null } });
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
});

// Get rate history (public)
router.get('/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const history = dbQueries.getExchangeRateHistory.all(limit);
        res.json({ history });
    } catch (error) {
        console.error('Error fetching rate history:', error);
        res.status(500).json({ error: 'Failed to fetch rate history' });
    }
});

// Update exchange rate (admin only)
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const { rate } = req.body;
        
        if (!rate || rate <= 0) {
            return res.status(400).json({ error: 'Valid exchange rate is required' });
        }
        
        const result = dbQueries.createExchangeRate.run(parseFloat(rate), req.user.id);
        const newRate = dbQueries.getCurrentExchangeRate.get();
        
        res.json({ 
            message: 'Exchange rate updated successfully',
            rate: newRate
        });
    } catch (error) {
        console.error('Error updating exchange rate:', error);
        res.status(500).json({ error: 'Failed to update exchange rate' });
    }
});

module.exports = router;
