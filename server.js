// ============================================
// INDIAKART - Express.js Server
// ============================================

const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================
// VIEW ENGINE
// ============================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: "indiakart_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Pass logged-in user to ALL views automatically
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
    next();
  });
}

// Basic security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

// ============================================
// DATA
// ============================================
const products = [
  { id: 1, name: "iPhone 15 Pro Max", price: 159900, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500", category: "electronics", description: "Latest flagship with titanium design and A17 Pro chip", rating: 4.8, stock: 25 },
  { id: 2, name: "MacBook Air M3", price: 134900, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", category: "electronics", description: "Powerful portable laptop with M3 chip", rating: 4.9, stock: 15 },
  { id: 3, name: "iPad Pro 12.9-inch", price: 109900, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", category: "electronics", description: "Professional tablet with M2 chip", rating: 4.7, stock: 20 },
  { id: 4, name: "Samsung Galaxy S24 Ultra", price: 129999, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500", category: "electronics", description: "Flagship Android with S Pen and AI features", rating: 4.6, stock: 30 },
  { id: 5, name: "Sony WH-1000XM5", price: 29990, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500", category: "electronics", description: "Industry-leading noise cancellation headphones", rating: 4.8, stock: 40 },
  { id: 6, name: "Dell XPS 15", price: 169999, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500", category: "electronics", description: "Premium Windows laptop for creators", rating: 4.7, stock: 12 },
  { id: 7, name: "Nike Air Max 270", price: 12995, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", category: "fashion", description: "Iconic sneakers with Max Air cushioning", rating: 4.5, stock: 50 },
  { id: 8, name: "Levi's 501 Original Jeans", price: 3999, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", category: "fashion", description: "Classic straight fit denim jeans", rating: 4.6, stock: 60 },
  { id: 9, name: "Ray-Ban Aviator Sunglasses", price: 8990, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500", category: "fashion", description: "Timeless style with UV protection", rating: 4.8, stock: 35 },
  { id: 10, name: "Adidas Ultraboost 22", price: 16999, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500", category: "fashion", description: "Premium running shoes with Boost cushioning", rating: 4.7, stock: 45 },
  { id: 11, name: "Smart LED TV 55-inch", price: 45999, image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500", category: "home", description: "4K Ultra HD Smart TV with HDR", rating: 4.5, stock: 18 },
  { id: 12, name: "Coffee Maker Pro", price: 8999, image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500", category: "home", description: "Programmable coffee maker with thermal carafe", rating: 4.4, stock: 25 },
  { id: 13, name: "Robot Vacuum Cleaner", price: 24999, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500", category: "home", description: "Smart vacuum with mapping and app control", rating: 4.6, stock: 15 },
  { id: 14, name: "HEPA Air Purifier", price: 15999, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500", category: "home", description: "HEPA filter air purifier for large rooms", rating: 4.7, stock: 22 },
  { id: 15, name: "Yoga Mat Premium", price: 2499, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500", category: "sports", description: "Non-slip exercise mat with carrying strap", rating: 4.5, stock: 70 },
  { id: 16, name: "Fitness Tracker Band", price: 4999, image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500", category: "sports", description: "Track steps, heart rate and sleep", rating: 4.3, stock: 55 },
  { id: 17, name: "Adjustable Dumbbells Set", price: 12999, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500", category: "sports", description: "Space-saving adjustable weights 5–25kg", rating: 4.6, stock: 20 },
  { id: 18, name: "Resistance Bands Set", price: 1499, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500", category: "sports", description: "5 resistance levels for full-body workout", rating: 4.4, stock: 80 },
  { id: 19, name: "Apple Watch Series 9", price: 44900, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500", category: "accessories", description: "Advanced smartwatch with health tracking", rating: 4.9, stock: 30 },
  { id: 20, name: "Leather Wallet RFID", price: 1999, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", category: "accessories", description: "Genuine leather bifold wallet with RFID blocking", rating: 4.5, stock: 100 },
  { id: 21, name: "Wireless Earbuds Pro", price: 9999, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500", category: "accessories", description: "True wireless with active noise cancellation", rating: 4.6, stock: 45 },
  { id: 22, name: "Power Bank 20000mAh", price: 2499, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500", category: "accessories", description: "Fast charging portable battery pack", rating: 4.4, stock: 65 },
  { id: 23, name: "Laptop Backpack", price: 3499, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", category: "accessories", description: "Water-resistant backpack with USB charging port", rating: 4.5, stock: 50 },
  { id: 24, name: "Premium Phone Case", price: 1299, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500", category: "accessories", description: "Military-grade drop protection case", rating: 4.3, stock: 120 },
];

const categories = [
  { id: "all", name: "All Products", icon: "fa-th" },
  { id: "electronics", name: "Electronics", icon: "fa-laptop" },
  { id: "fashion", name: "Fashion", icon: "fa-tshirt" },
  { id: "home", name: "Home & Living", icon: "fa-home" },
  { id: "sports", name: "Sports & Fitness", icon: "fa-dumbbell" },
  { id: "accessories", name: "Accessories", icon: "fa-watch" },
];

function getProductsByCategory(category) {
  if (!category || category === "all") return products;
  return products.filter(p => p.category === category);
}

function getProductById(id) {
  return products.find(p => p.id === parseInt(id));
}

function getFeaturedProducts(limit = 8) {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

// ============================================
// PAGE ROUTES
// ============================================

app.get("/", (req, res) => {
  try {
    res.render("index", {
      title: "IndiaKart - Premium E-Commerce",
      featuredProducts: getFeaturedProducts(8),
    });
  } catch (err) {
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

app.get("/products", (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let filtered = getProductsByCategory(category);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

    res.render("products", {
      title: "Products - IndiaKart",
      products: filtered,
      categories,
      currentCategory: category || "all",
      currentSort: sort || "default",
      searchQuery: search || "",
    });
  } catch (err) {
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

app.get("/about", (req, res) => {
  try {
    res.render("about", { title: "About Us - IndiaKart" });
  } catch (err) {
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

app.get("/contact", (req, res) => {
  try {
    res.render("contact", { title: "Contact Us - IndiaKart" });
  } catch (err) {
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

// ============================================
// AUTH ROUTES
// ============================================

app.get("/signup", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("Signup", { title: "Sign Up - IndiaKart", error: null });
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("SIGNUP DATA RECEIVED:", { name, email, password });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );
    console.log("✅ USER SAVED TO DATABASE SUCCESSFULLY");
    res.redirect("/login");
  } catch (err) {
    console.error("❌ DATABASE ERROR:", err.message);
    res.render("Signup", { title: "Sign Up - IndiaKart", error: err.message });
  }
});

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("login", { title: "Login - IndiaKart", error: null });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN ATTEMPT:", email);
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.render("login", { title: "Login - IndiaKart", error: "User not found." });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.render("login", { title: "Login - IndiaKart", error: "Incorrect password." });

    req.session.user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    console.log("✅ USER LOGGED IN:", rows[0].email);
    res.redirect("/");
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    res.render("login", { title: "Login - IndiaKart", error: "Login error. Try again." });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/account", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.total, o.status, o.created_at 
       FROM orders o WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [req.session.user.id]
    );
    const [cartItems] = await db.query(
      `SELECT p.name, p.price, p.image, c.quantity, c.id
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.session.user.id]
    );
    res.render("account", {
      title: "My Account - IndiaKart",
      user: req.session.user,
      orders,
      cartItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

// ============================================
// CART ROUTES
// ============================================

app.get("/cart", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    const [items] = await db.query(
      `SELECT p.name, p.price, p.image, c.quantity, c.id
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.session.user.id]
    );
    res.render("cart", { title: "Shopping Cart - IndiaKart", items });
  } catch (err) {
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

app.post("/cart/add", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const { product_id, quantity } = req.body;
  const user_id = req.session.user.id;
  try {
    const [existing] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );
    if (existing.length) {
      await db.query(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity || 1, user_id, product_id]
      );
    } else {
      await db.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [user_id, product_id, quantity || 1]
      );
    }
    res.redirect("/cart");
  } catch (err) {
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

app.post("/cart/remove/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM cart WHERE id = ?", [req.params.id]);
    res.redirect("/cart");
  } catch (err) {
    res.status(500).render("error", { error: "500 Server Error", message: err.message });
  }
});

// ============================================
// API ROUTES
// ============================================

app.get("/api/products", (req, res) => {
  res.json({ success: true, count: products.length, products });
});

app.get("/api/products/:id", (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ success: false, error: "Product not found" });
  res.json({ success: true, product });
});

app.post("/api/contact", async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: "All required fields must be filled" });
  }
  try {
    await db.query(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
      [`${firstName} ${lastName}`, email, `${subject}: ${message}`]
    );
    res.json({ success: true, message: "Message received. We'll respond within 24 hours!" });
  } catch (err) {
    console.error("❌ CONTACT ERROR:", err.message);
    res.status(500).json({ success: false, error: "Could not save message." });
  }
});

app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "Valid email required" });
  }
  console.log("Newsletter subscription:", email);
  res.json({ success: true, message: "Successfully subscribed!" });
});

// ============================================
// 404 & ERROR HANDLERS
// ============================================
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 - Not Found",
    error: "404 Page Not Found",
    message: `The page "${req.url}" doesn't exist.`,
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).render("error", {
    title: "Error",
    error: "500 Server Error",
    message: NODE_ENV === "development" ? err.message : "Please try again later.",
  });
});

// ============================================
// START SERVER
// ============================================
const server = app.listen(PORT, () => {
  console.log("  🛍️  IndiaKart E-Commerce Platform");
  console.log(`  🚀 Running: http://localhost:${PORT}`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));

module.exports = app;