const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


// PRODUCTS DATABASE (Mock)
const allProducts = [
    {
        name: "iPhone 17 Pro",
        price: 100000,
        image: "https://via.placeholder.com/200",
        category: "electronics",
        badge: "NEW",
        badgeClass: "new"
    },
    {
        name: "MacBook Pro",
        price: 150000,
        image: "https://via.placeholder.com/200",
        category: "electronics",
        badge: "SALE",
        badgeClass: "sale"
    },
    {
        name: "Bluetooth Speaker",
        price: 2999,
        image: "https://via.placeholder.com/200",
        category: "accessories",
        badge: "SALE",
        badgeClass: "sale"
    },
    {
        name: "Smart Watch",
        price: 4499,
        image: "https://via.placeholder.com/200",
        category: "fashion",
        badge: null,
        badgeClass: ""
    }
];


// Home
app.get("/", (req, res) => {
    res.render("index");
});

// Products
app.get("/products", (req, res) => {

    const category = req.query.category;

    let filteredProducts = allProducts;

    if (category) {
        filteredProducts = allProducts.filter(p => p.category === category);
    }

    res.render("products", {
        title: category ? category.toUpperCase() : "All Products",
        products: filteredProducts
    });

});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
