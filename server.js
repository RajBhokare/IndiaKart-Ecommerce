const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const products = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 119999,
    image: "https://images.unsplash.com/photo-1603899123009-ef2c2d9e7e6e",
    category: "electronics"
  },
  {
    id: 2,
    name: "MacBook Air M3",
    price: 129999,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    category: "electronics"
  },
  {
    id: 3,
    name: "Smart Watch",
    price: 4499,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
    category: "accessories"
  },
  {
    id: 4,
    name: "Wireless Headphones",
    price: 2999,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
    category: "accessories"
  }
];

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/products", (req, res) => {
  res.render("products", { products });
});

app.get("/cart", (req, res) => {
  res.render("cart");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

app.listen(PORT, () => {
  console.log(`🚀 IndiaKart running at http://localhost:${PORT}`);
});
