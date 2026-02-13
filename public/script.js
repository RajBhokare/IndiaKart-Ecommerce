// =============================
// INDIAKART PROFESSIONAL SCRIPT
// =============================

const IndiaKart = {

    cart: JSON.parse(localStorage.getItem("cart")) || [],

    init() {
        this.bindAddToCart();
        this.renderCart();
        this.updateCartCount();
        this.bindContactForm();
    },

    saveCart() {
        localStorage.setItem("cart", JSON.stringify(this.cart));
    },

    bindAddToCart() {

        document.querySelectorAll(".product-card .btn-cart").forEach(btn => {

            btn.addEventListener("click", (e) => {

                const card = e.target.closest(".product-card");

                const name = card.querySelector("h3").innerText.trim();
                const price = this.extractPrice(card.querySelector(".price").innerText);
                const image = card.querySelector("img")?.src || "";

                const existing = this.cart.find(item => item.name === name);

                if (existing) {
                    existing.quantity++;
                } else {
                    this.cart.push({ name, price, image, quantity: 1 });
                }

                this.saveCart();
                this.updateCartCount();
                this.showToast(name + " added to cart");

            });

        });

    },

    renderCart() {

        const cartBox = document.querySelector(".cart-box");
        if (!cartBox) return;

        cartBox.innerHTML = "";

        if (this.cart.length === 0) {
            cartBox.innerHTML = "<h3>Your cart is empty 🛒</h3>";
            return;
        }

        let total = 0;

        this.cart.forEach((item, index) => {

            total += item.price * item.quantity;

            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");

            itemDiv.innerHTML = `
                <img src="${item.image}" width="80">
                <div>
                    <h4>${item.name}</h4>
                    <p>₹${item.price}</p>
                    <div>
                        <button class="qty-btn" data-index="${index}" data-change="-1">-</button>
                        ${item.quantity}
                        <button class="qty-btn" data-index="${index}" data-change="1">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-remove="${index}">Remove</button>
            `;

            cartBox.appendChild(itemDiv);

        });

        const totalDiv = document.createElement("div");
        totalDiv.innerHTML = `
            <h3>Total: ₹${total}</h3>
            <button id="checkoutBtn">Checkout</button>
        `;

        cartBox.appendChild(totalDiv);

        this.bindCartActions();

    },

    bindCartActions() {

        document.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                const change = parseInt(e.target.dataset.change);
                this.cart[index].quantity += change;

                if (this.cart[index].quantity <= 0) {
                    this.cart.splice(index, 1);
                }

                this.saveCart();
                this.renderCart();
                this.updateCartCount();
            });
        });

        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.dataset.remove;
                this.cart.splice(index, 1);
                this.saveCart();
                this.renderCart();
                this.updateCartCount();
            });
        });

        const checkoutBtn = document.getElementById("checkoutBtn");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                this.cart = [];
                this.saveCart();
                this.renderCart();
                this.updateCartCount();
                this.showToast("Order placed successfully 🎉");
            });
        }

    },

    updateCartCount() {
        const totalQty = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartLink = document.querySelector(".navbar a[href='/cart']");
        if (cartLink) {
            cartLink.innerText = `Cart (${totalQty})`;
        }
    },

    bindContactForm() {

        const form = document.querySelector(".contact-form form");
        if (!form) return;

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.showToast("Message sent successfully 📩");
            form.reset();
        });

    },

    extractPrice(text) {
        return parseInt(text.replace(/[₹,]/g, "")) || 0;
    },

    showToast(message) {

        const toast = document.createElement("div");
        toast.innerText = message;
        toast.style.position = "fixed";
        toast.style.bottom = "20px";
        toast.style.right = "20px";
        toast.style.background = "#333";
        toast.style.color = "white";
        toast.style.padding = "10px 15px";
        toast.style.borderRadius = "5px";
        toast.style.zIndex = "9999";

        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

};

document.addEventListener("DOMContentLoaded", () => {
    IndiaKart.init();
});

document.addEventListener("click", function (e) {

    if (e.target.classList.contains("btn-cart")) {

        const name = e.target.dataset.name;
        const price = parseInt(e.target.dataset.price);
        const image = e.target.dataset.image;

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find(item => item.name === name);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert(name + " added to cart 🛒");
    }
});
