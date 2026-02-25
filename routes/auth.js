const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Email already exists.');
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.send('User not found.');

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.send('Incorrect password.');

    req.session.user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('Login error.');
  }
});

// LOGOUT
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;