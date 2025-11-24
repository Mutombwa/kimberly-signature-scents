const express = require('express');
const { body, validationResult } = require('express-validator');
const { dbQueries } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all posts (public with optional auth for like status)
router.get('/posts', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const posts = dbQueries.getAllPosts.all(limit, offset);

        res.json({
            success: true,
            page,
            limit,
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts'
        });
    }
});

// Get posts by category
router.get('/posts/category/:category', (req, res) => {
    try {
        const posts = dbQueries.getPostsByCategory.all(req.params.category);

        res.json({
            success: true,
            category: req.params.category,
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error('Get posts by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts'
        });
    }
});

// Get single post with comments
router.get('/posts/:id', (req, res) => {
    try {
        const post = dbQueries.getPostById.get(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comments = dbQueries.getCommentsByPostId.all(req.params.id);

        res.json({
            success: true,
            post: {
                ...post,
                comments
            }
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching post'
        });
    }
});

// Create new post (requires authentication)
router.post('/posts', authenticateToken,
    [
        body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
        body('content').trim().notEmpty().withMessage('Content is required'),
        body('category').notEmpty().withMessage('Category is required')
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

            const { title, content, category } = req.body;

            const result = dbQueries.createPost.run(
                req.user.id,
                title,
                content,
                category
            );

            res.status(201).json({
                success: true,
                message: 'Post created successfully',
                postId: result.lastInsertRowid
            });
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating post'
            });
        }
    }
);

// Update post (author only)
router.put('/posts/:id', authenticateToken,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
        body('category').notEmpty().withMessage('Category is required')
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

            const { title, content, category } = req.body;

            const result = dbQueries.updatePost.run(
                title,
                content,
                category,
                req.params.id,
                req.user.id
            );

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found or you do not have permission to edit it'
                });
            }

            res.json({
                success: true,
                message: 'Post updated successfully'
            });
        } catch (error) {
            console.error('Update post error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating post'
            });
        }
    }
);

// Delete post (author only)
router.delete('/posts/:id', authenticateToken, (req, res) => {
    try {
        const result = dbQueries.deletePost.run(req.params.id, req.user.id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post'
        });
    }
});

// Add comment to post
router.post('/posts/:id/comments', authenticateToken,
    [
        body('content').trim().notEmpty().withMessage('Comment content is required')
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

            const { content } = req.body;

            const result = dbQueries.createComment.run(
                req.params.id,
                req.user.id,
                content
            );

            // Increment comment count
            dbQueries.incrementPostComments.run(req.params.id);

            res.status(201).json({
                success: true,
                message: 'Comment added successfully',
                commentId: result.lastInsertRowid
            });
        } catch (error) {
            console.error('Add comment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding comment'
            });
        }
    }
);

// Delete comment
router.delete('/comments/:id', authenticateToken, (req, res) => {
    try {
        const result = dbQueries.deleteComment.run(req.params.id, req.user.id);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
});

// Like/Unlike post
router.post('/posts/:id/like', authenticateToken, (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        // Check if already liked
        const hasLiked = dbQueries.hasUserLikedPost.get(postId, userId);

        if (hasLiked.liked > 0) {
            // Unlike
            dbQueries.unlikePost.run(postId, userId);
        } else {
            // Like
            dbQueries.likePost.run(postId, userId);
        }

        // Update likes count
        dbQueries.updatePostLikes.run(postId, postId);

        res.json({
            success: true,
            message: hasLiked.liked > 0 ? 'Post unliked' : 'Post liked',
            liked: hasLiked.liked === 0
        });
    } catch (error) {
        console.error('Like/unlike error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing like'
        });
    }
});

// Get all categories
router.get('/categories', (req, res) => {
    try {
        const categories = dbQueries.getAllCategories.all();

        res.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
});

module.exports = router;
