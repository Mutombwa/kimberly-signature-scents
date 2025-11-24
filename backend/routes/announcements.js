const express = require('express');
const router = express.Router();
const { dbQueries } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all announcements (public)
router.get('/', async (req, res) => {
    try {
        const announcements = dbQueries.getAllAnnouncements.all();
        res.json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Get single announcement (public)
router.get('/:id', async (req, res) => {
    try {
        const announcement = dbQueries.getAnnouncementById.get(req.params.id);
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        res.json({ announcement });
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ error: 'Failed to fetch announcement' });
    }
});

// Create announcement (admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, category, content, image, isPinned } = req.body;
        
        if (!title || !category || !content) {
            return res.status(400).json({ error: 'Title, category, and content are required' });
        }
        
        const result = dbQueries.createAnnouncement.run(
            title,
            category,
            content,
            image || null,
            isPinned ? 1 : 0,
            req.user.id
        );
        
        const announcement = dbQueries.getAnnouncementById.get(result.lastInsertRowid);
        res.status(201).json({ announcement });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Update announcement (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, category, content, image, isPinned } = req.body;
        
        dbQueries.updateAnnouncement.run(
            title,
            category,
            content,
            image,
            isPinned ? 1 : 0,
            req.params.id
        );
        
        const announcement = dbQueries.getAnnouncementById.get(req.params.id);
        res.json({ announcement });
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

// Delete announcement (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        dbQueries.deleteAnnouncement.run(req.params.id);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

module.exports = router;
