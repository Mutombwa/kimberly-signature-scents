const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
    // Users table for account management
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            date_of_birth TEXT,
            address TEXT,
            kit_choice TEXT,
            role TEXT DEFAULT 'user',
            profile_image TEXT,
            bio TEXT,
            joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active INTEGER DEFAULT 1,
            email_verified INTEGER DEFAULT 0
        )
    `);

    // Customer registrations table (form submissions)
    db.exec(`
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            address TEXT NOT NULL,
            kit_choice TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_confirmed INTEGER DEFAULT 0,
            submitted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT
        )
    `);

    // Community posts table
    db.exec(`
        CREATE TABLE IF NOT EXISTS community_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT,
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_pinned INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Comments table
    db.exec(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Likes table
    db.exec(`
        CREATE TABLE IF NOT EXISTS post_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, user_id),
            FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Categories table for posts
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            icon TEXT
        )
    `);

    // Announcements table (admin posts)
    db.exec(`
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            content TEXT NOT NULL,
            image TEXT,
            is_pinned INTEGER DEFAULT 0,
            author_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Exchange rates table
    db.exec(`
        CREATE TABLE IF NOT EXISTS exchange_rates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rate REAL NOT NULL,
            updated_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Insert default categories
    const insertCategory = db.prepare(`
        INSERT OR IGNORE INTO categories (name, description, icon) 
        VALUES (?, ?, ?)
    `);

    const categories = [
        ['Success Stories', 'Share your achievements and milestones', 'fa-trophy'],
        ['Product Reviews', 'Your thoughts on our fragrances', 'fa-star'],
        ['Business Tips', 'Tips and strategies for growing your business', 'fa-lightbulb'],
        ['Questions', 'Ask the community anything', 'fa-question-circle'],
        ['Announcements', 'Official updates and news', 'fa-bullhorn'],
        ['General Discussion', 'Anything and everything', 'fa-comments']
    ];

    categories.forEach(cat => insertCategory.run(...cat));

    console.log('✅ Database initialized successfully');
}

// Database query functions
const dbQueries = {
    // User management
    createUser: db.prepare(`
        INSERT INTO users (full_name, email, password, phone, date_of_birth, address, kit_choice)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `),

    getUserByEmail: db.prepare(`
        SELECT * FROM users WHERE email = ?
    `),

    getUserById: db.prepare(`
        SELECT id, full_name, email, phone, date_of_birth, address, kit_choice, role, 
               profile_image, bio, joined_date, last_login, email_verified
        FROM users WHERE id = ?
    `),

    updateUserProfile: db.prepare(`
        UPDATE users 
        SET full_name = ?, phone = ?, bio = ?, profile_image = ?
        WHERE id = ?
    `),

    updateLastLogin: db.prepare(`
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `),

    getAllUsers: db.prepare(`
        SELECT id, full_name, email, phone, kit_choice, joined_date, is_active
        FROM users 
        ORDER BY joined_date DESC
    `),

    // Registration management
    createRegistration: db.prepare(`
        INSERT INTO registrations (full_name, email, phone, date_of_birth, address, kit_choice)
        VALUES (?, ?, ?, ?, ?, ?)
    `),

    getAllRegistrations: db.prepare(`
        SELECT * FROM registrations ORDER BY submitted_date DESC
    `),

    updateRegistrationStatus: db.prepare(`
        UPDATE registrations 
        SET status = ?, payment_confirmed = ?, notes = ?
        WHERE id = ?
    `),

    getRegistrationById: db.prepare(`
        SELECT * FROM registrations WHERE id = ?
    `),

    // Community posts
    createPost: db.prepare(`
        INSERT INTO community_posts (user_id, title, content, category)
        VALUES (?, ?, ?, ?)
    `),

    getAllPosts: db.prepare(`
        SELECT 
            p.*,
            u.full_name as author_name,
            u.profile_image as author_image
        FROM community_posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.is_pinned DESC, p.created_at DESC
        LIMIT ? OFFSET ?
    `),

    getPostById: db.prepare(`
        SELECT 
            p.*,
            u.full_name as author_name,
            u.profile_image as author_image,
            u.bio as author_bio
        FROM community_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    `),

    getPostsByCategory: db.prepare(`
        SELECT 
            p.*,
            u.full_name as author_name,
            u.profile_image as author_image
        FROM community_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.category = ?
        ORDER BY p.is_pinned DESC, p.created_at DESC
    `),

    updatePost: db.prepare(`
        UPDATE community_posts 
        SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    `),

    deletePost: db.prepare(`
        DELETE FROM community_posts WHERE id = ? AND user_id = ?
    `),

    incrementPostComments: db.prepare(`
        UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = ?
    `),

    // Comments
    createComment: db.prepare(`
        INSERT INTO comments (post_id, user_id, content)
        VALUES (?, ?, ?)
    `),

    getCommentsByPostId: db.prepare(`
        SELECT 
            c.*,
            u.full_name as author_name,
            u.profile_image as author_image
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    `),

    deleteComment: db.prepare(`
        DELETE FROM comments WHERE id = ? AND user_id = ?
    `),

    // Likes
    likePost: db.prepare(`
        INSERT OR IGNORE INTO post_likes (post_id, user_id)
        VALUES (?, ?)
    `),

    unlikePost: db.prepare(`
        DELETE FROM post_likes WHERE post_id = ? AND user_id = ?
    `),

    updatePostLikes: db.prepare(`
        UPDATE community_posts 
        SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?)
        WHERE id = ?
    `),

    hasUserLikedPost: db.prepare(`
        SELECT COUNT(*) as liked FROM post_likes WHERE post_id = ? AND user_id = ?
    `),

    // Categories
    getAllCategories: db.prepare(`
        SELECT * FROM categories ORDER BY name
    `),

    // Announcements
    getAllAnnouncements: db.prepare(`
        SELECT 
            a.*,
            u.full_name as author_name
        FROM announcements a
        JOIN users u ON a.author_id = u.id
        ORDER BY a.is_pinned DESC, a.created_at DESC
    `),

    getAnnouncementById: db.prepare(`
        SELECT 
            a.*,
            u.full_name as author_name
        FROM announcements a
        JOIN users u ON a.author_id = u.id
        WHERE a.id = ?
    `),

    createAnnouncement: db.prepare(`
        INSERT INTO announcements (title, category, content, image, is_pinned, author_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `),

    updateAnnouncement: db.prepare(`
        UPDATE announcements 
        SET title = ?, category = ?, content = ?, image = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `),

    deleteAnnouncement: db.prepare(`
        DELETE FROM announcements WHERE id = ?
    `),

    // Exchange Rates
    getCurrentExchangeRate: db.prepare(`
        SELECT rate, created_at as last_updated
        FROM exchange_rates
        ORDER BY created_at DESC
        LIMIT 1
    `),

    getExchangeRateHistory: db.prepare(`
        SELECT 
            er.rate,
            er.created_at as last_updated,
            u.full_name as updated_by_name
        FROM exchange_rates er
        JOIN users u ON er.updated_by = u.id
        ORDER BY er.created_at DESC
        LIMIT ?
    `),

    createExchangeRate: db.prepare(`
        INSERT INTO exchange_rates (rate, updated_by)
        VALUES (?, ?)
    `),

    // Statistics
    getStats: db.prepare(`
        SELECT 
            (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_users,
            (SELECT COUNT(*) FROM registrations) as total_registrations,
            (SELECT COUNT(*) FROM community_posts) as total_posts,
            (SELECT COUNT(*) FROM comments) as total_comments
    `)
};

module.exports = {
    db,
    initializeDatabase,
    dbQueries
};
