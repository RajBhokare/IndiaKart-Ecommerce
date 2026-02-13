// ===============================
// INDIAKART COMPLETE SCRIPT
// ===============================

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {

    updateCartCount();
    setupAddToCart();
    renderCartPage();
    setupContactForm();

});

// ===============================
// ADD TO CART FUNCTION
// ===============================

function setupAddToCart() {

    const buttons = document.querySelectorAll(".product button");

    buttons.forEach(button => {
        button.addEventListener("click", function () {

            const product = this.closest(".product");

            let name = product.querySelector("h3")?.innerText.trim() || "Product";
            let priceText = product.querySelector(".price")?.innerText.trim() || "₹0";
            let image = product.querySelector("img")?.src || "";

            let price = extractPrice(priceText);

            const existing = cart.find(item => item.name === name);

            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    name,
                    price,
                    image,
                    quantity: 1
                });
            }

            saveCart();
            updateCartCount();
            alert(name + " added to cart 🛒");

        });
    });
}

// ===============================
// SAVE CART
// ===============================

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// ===============================
// CART COUNT
// ===============================

function updateCartCount() {

    const navLinks = document.querySelectorAll(".navbar a");

    let totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

    navLinks.forEach(link => {
        if (link.innerText.includes("Cart")) {
            link.innerText = "Cart (" + totalQty + ")";
        }
    });

}

// ===============================
// RENDER CART PAGE
// ===============================

function renderCartPage() {

    const cartBox = document.querySelector(".cart-box");
    if (!cartBox) return;

    cartBox.innerHTML = "";

    if (cart.length === 0) {
        cartBox.innerHTML = "<h3>Your cart is empty 😢</h3>";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {

        total += item.price * item.quantity;

        const div = document.createElement("div");
        div.style.marginBottom = "15px";

        div.innerHTML = `
            <p><strong>${item.name}</strong></p>
            <p>Price: ₹${item.price}</p>
            <p>
                Quantity: 
                <button onclick="changeQty(${index}, -1)">-</button>
                ${item.quantity}
                <button onclick="changeQty(${index}, 1)">+</button>
            </p>
            <button onclick="removeItem(${index})">Remove</button>
            <hr>
        `;

        cartBox.appendChild(div);

    });

    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `
        <h3>Total: ₹${total}</h3>
        <button onclick="checkout()">Checkout</button>
        <button onclick="clearCart()" style="margin-left:10px;">Clear Cart</button>
    `;

    cartBox.appendChild(totalDiv);
}

// ===============================
// CHANGE QUANTITY
// ===============================

function changeQty(index, amount) {

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    renderCartPage();
    updateCartCount();
}

// ===============================
// REMOVE ITEM
// ===============================

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartPage();
    updateCartCount();
}

// ===============================
// CLEAR CART
// ===============================

function clearCart() {
    cart = [];
    saveCart();
    renderCartPage();
    updateCartCount();
}

// ===============================
// CHECKOUT
// ===============================

function checkout() {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("🎉 Order Placed Successfully!");
    cart = [];
    saveCart();
    renderCartPage();
    updateCartCount();
}

// ===============================
// CONTACT FORM
// ===============================

function setupContactForm() {

    const formBox = document.querySelector(".form-box");
    if (!formBox) return;

    const button = formBox.querySelector("button");

    button.addEventListener("click", function () {

        const name = formBox.querySelector("input[type='text']").value;
        const email = formBox.querySelector("input[type='email']").value;
        const message = formBox.querySelector("textarea").value;

        if (!name || !email || !message) {
            alert("Please fill all fields!");
            return;
        }

        alert("Thank you " + name + "! We will contact you soon 📩");

        formBox.querySelectorAll("input, textarea").forEach(input => input.value = "");

    });
}

// ===============================
// PRICE EXTRACTOR
// ===============================

function extractPrice(text) {
    return parseInt(text.replace(/[₹,\/-]/g, "")) || 0;
}
