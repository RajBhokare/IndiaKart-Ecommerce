const express = require('express');
const router = express.Router();
const db = require('../db');

// VIEW CART
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const [items] = await db.query(
    `SELECT p.name, p.price, p.image, c.quantity, c.id
     FROM cart c JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [req.session.user.id]
  );
  res.render('cart', { items });
});

// ADD TO CART
router.post('/add', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { product_id, quantity } = req.body;
  const user_id = req.session.user.id;

  const [existing] = await db.query(
    'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
    [user_id, product_id]
  );

  if (existing.length) {
    await db.query(
      'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
      [quantity || 1, user_id, product_id]
    );
  } else {
    await db.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user_id, product_id, quantity || 1]
    );
  }
  res.redirect('/cart');
});

// REMOVE FROM CART
router.post('/remove/:id', async (req, res) => {
  await db.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
  res.redirect('/cart');
});

module.exports = router;