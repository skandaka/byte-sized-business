/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');

const db = new sqlite3.Database(DB_PATH);
const JWT_SECRET = process.env.JWT_SECRET || 'fbla-business-boost-secret-key-2025';

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { username, email, password }
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Password validation (8+ chars, 1 uppercase, 1 number)
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' });
  }

  // Username validation
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  try {
    // Check if user already exists
    db.get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username],
      async (err, existingUser) => {
        if (err) {
          console.error('Error checking existing user:', err);
          return res.status(500).json({ error: 'Registration failed' });
        }

        if (existingUser) {
          return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        const id = uuidv4();

        // Create user
        db.run(
          'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
          [id, username, email, password_hash],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return res.status(500).json({ error: 'Registration failed' });
            }

            // Generate JWT token
            const token = jwt.sign(
              { userId: id, username, email },
              JWT_SECRET,
              { expiresIn: '7d' }
            );

            res.status(201).json({
              message: 'User created successfully',
              user: {
                id,
                username,
                email,
                is_admin: 0
              },
              token
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          console.error('Error fetching user:', err);
          return res.status(500).json({ error: 'Login failed' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, username: user.username, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
          },
          token
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 * Headers: Authorization: Bearer <token>
 */
router.get('/profile', verifyToken, (req, res) => {
  const { userId } = req.user;

  const query = `
    SELECT
      u.id,
      u.username,
      u.email,
      u.is_admin,
      u.created_at,
      COUNT(DISTINCT r.id) as review_count,
      COUNT(DISTINCT f.id) as favorite_count
    FROM users u
    LEFT JOIN reviews r ON u.id = r.user_id
    LEFT JOIN favorites f ON u.id = f.user_id
    WHERE u.id = ?
    GROUP BY u.id
  `;

  db.get(query, [userId], (err, profile) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  });
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal mainly)
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

/**
 * Middleware: Verify JWT token
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
}

module.exports = router;
module.exports.verifyToken = verifyToken;
