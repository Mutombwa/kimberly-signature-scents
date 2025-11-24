const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { path } = req.query;

    try {
        // Register endpoint
        if (req.method === 'POST' && (!path || path[0] === 'register')) {
            const { full_name, email, phone, password } = req.body;

            // Validate input
            if (!full_name || !email || !phone || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required' 
                });
            }

            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password must be at least 6 characters' 
                });
            }

            // Check if user exists
            const existingUser = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already registered' 
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Determine role
            const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

            // Insert user
            const result = await pool.query(
                `INSERT INTO users (full_name, email, phone, password, role) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id, full_name, email, phone, role, created_at`,
                [full_name, email, phone, hashedPassword, role]
            );

            const user = result.rows[0];

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'kimberly-secret-2025-secure-key',
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        }

        // Login endpoint
        if (req.method === 'POST' && path && path[0] === 'login') {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email and password are required' 
                });
            }

            // Find user
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            const user = result.rows[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'kimberly-secret-2025-secure-key',
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        }

        res.status(404).json({ success: false, message: 'Endpoint not found' });

    } catch (error) {
        console.error('Auth API Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
};
