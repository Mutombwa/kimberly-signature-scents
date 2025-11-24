// PostgreSQL Database Configuration
// ============================================
const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize database tables
const initializeDatabase = async () => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Registrations table
        await client.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                date_of_birth DATE,
                address TEXT,
                starter_kit VARCHAR(100),
                status VARCHAR(50) DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Community posts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(100),
                image_url TEXT,
                likes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Comments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Likes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS post_likes (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(post_id, user_id)
            )
        `);

        // Announcements table
        await client.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                content TEXT NOT NULL,
                image_url TEXT,
                is_pinned BOOLEAN DEFAULT false,
                author_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Exchange rates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS exchange_rates (
                id SERIAL PRIMARY KEY,
                rate DECIMAL(10, 4) NOT NULL,
                updated_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Products table
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image_urls TEXT[],
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes for better performance
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned)');

        await client.query('COMMIT');
        console.log('✅ Database tables initialized successfully');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Database query helper
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// User operations
const userDB = {
    async create(userData) {
        const { full_name, email, phone, password_hash, role = 'user' } = userData;
        const result = await query(
            'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [full_name, email, phone, password_hash, role]
        );
        return result.rows[0];
    },

    async findByEmail(email) {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    async findById(id) {
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    },

    async getAll() {
        const result = await query('SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
        return result.rows;
    }
};

// Registration operations
const registrationDB = {
    async create(data) {
        const { full_name, email, phone, date_of_birth, address, starter_kit, notes = '' } = data;
        const result = await query(
            'INSERT INTO registrations (full_name, email, phone, date_of_birth, address, starter_kit, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [full_name, email, phone, date_of_birth, address, starter_kit, notes]
        );
        return result.rows[0];
    },

    async getAll() {
        const result = await query('SELECT * FROM registrations ORDER BY created_at DESC');
        return result.rows;
    },

    async updateStatus(id, status, notes) {
        const result = await query(
            'UPDATE registrations SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [status, notes, id]
        );
        return result.rows[0];
    }
};

// Post operations
const postDB = {
    async create(data) {
        const { user_id, title, content, category, image_url } = data;
        const result = await query(
            'INSERT INTO posts (user_id, title, content, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, title, content, category, image_url]
        );
        return result.rows[0];
    },

    async getAll() {
        const result = await query(`
            SELECT p.*, u.full_name as author_name, u.email as author_email,
                   (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
                   (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        return result.rows;
    },

    async getById(id) {
        const result = await query(`
            SELECT p.*, u.full_name as author_name, u.email as author_email,
                   (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `, [id]);
        return result.rows[0];
    }
};

// Comment operations
const commentDB = {
    async create(data) {
        const { post_id, user_id, content } = data;
        const result = await query(
            'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [post_id, user_id, content]
        );
        return result.rows[0];
    },

    async getByPostId(postId) {
        const result = await query(`
            SELECT c.*, u.full_name as author_name, u.email as author_email
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [postId]);
        return result.rows;
    }
};

// Like operations
const likeDB = {
    async toggle(postId, userId) {
        // Check if like exists
        const check = await query(
            'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
            [postId, userId]
        );

        if (check.rows.length > 0) {
            // Unlike
            await query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            return { liked: false };
        } else {
            // Like
            await query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
            return { liked: true };
        }
    }
};

// Announcement operations
const announcementDB = {
    async create(data) {
        const { title, category, content, image_url, is_pinned = false, author_id } = data;
        const result = await query(
            'INSERT INTO announcements (title, category, content, image_url, is_pinned, author_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, category, content, image_url, is_pinned, author_id]
        );
        return result.rows[0];
    },

    async getAll() {
        const result = await query(`
            SELECT a.*, u.full_name as author_name
            FROM announcements a
            LEFT JOIN users u ON a.author_id = u.id
            ORDER BY a.is_pinned DESC, a.created_at DESC
        `);
        return result.rows;
    },

    async getById(id) {
        const result = await query('SELECT * FROM announcements WHERE id = $1', [id]);
        return result.rows[0];
    },

    async update(id, data) {
        const { title, category, content, image_url, is_pinned } = data;
        const result = await query(
            'UPDATE announcements SET title = $1, category = $2, content = $3, image_url = $4, is_pinned = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [title, category, content, image_url, is_pinned, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        await query('DELETE FROM announcements WHERE id = $1', [id]);
    }
};

// Exchange rate operations
const exchangeRateDB = {
    async create(rate, userId) {
        const result = await query(
            'INSERT INTO exchange_rates (rate, updated_by) VALUES ($1, $2) RETURNING *',
            [rate, userId]
        );
        return result.rows[0];
    },

    async getCurrent() {
        const result = await query(
            'SELECT * FROM exchange_rates ORDER BY created_at DESC LIMIT 1'
        );
        return result.rows[0];
    },

    async getHistory(limit = 20) {
        const result = await query(
            'SELECT * FROM exchange_rates ORDER BY created_at DESC LIMIT $1',
            [limit]
        );
        return result.rows;
    }
};

// Product operations
const productDB = {
    async create(data) {
        const { name, description, image_urls, created_by } = data;
        const result = await query(
            'INSERT INTO products (name, description, image_urls, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, image_urls, created_by]
        );
        return result.rows[0];
    },

    async getAll() {
        const result = await query('SELECT * FROM products ORDER BY created_at DESC');
        return result.rows;
    },

    async delete(id) {
        await query('DELETE FROM products WHERE id = $1', [id]);
    }
};

module.exports = {
    pool,
    query,
    initializeDatabase,
    userDB,
    registrationDB,
    postDB,
    commentDB,
    likeDB,
    announcementDB,
    exchangeRateDB,
    productDB
};
