const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await db.query(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.send('Message received!');
  } catch (err) {
    console.error(err);
    res.send('Error sending message.');
  }
});

module.exports = router;