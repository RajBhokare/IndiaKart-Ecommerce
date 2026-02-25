// ============================================
// INDIAKART - Complete JavaScript
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  // ============================================
  // CART MANAGEMENT
  // ============================================
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("cart")) || []; } catch(e) { cart = []; }

  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById("cartBadge");
    const cartCounts = document.querySelectorAll(".cart-count");

    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? "flex" : "none";
    }

    cartCounts.forEach(el => { el.textContent = totalItems; });
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function addToCart(name, price, image) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: Date.now(), name, price: parseFloat(price), image, quantity: 1 });
    }
    updateCartCount();
    showToast(`"${name.substring(0,30)}" added to cart!`);
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== parseInt(id));
    updateCartCount();
    renderCart();
    showToast("Item removed from cart");
  }

  function updateQuantity(id, change) {
    const item = cart.find(item => item.id === parseInt(id));
    if (item) {
      item.quantity = Math.max(1, item.quantity + change);
      updateCartCount();
      renderCart();
    }
  }

  function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
      cart = [];
      updateCartCount();
      renderCart();
      showToast("Cart cleared");
    }
  }

  function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + tax + shipping;
    return { subtotal, tax, shipping, total };
  }

  function renderCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const cartItemCount = document.getElementById("cartItemCount");
    if (!cartItemsContainer) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartItemCount) cartItemCount.textContent = totalItems;

    if (cart.length === 0) {
      cartItemsContainer.style.display = "none";
      if (emptyCart) emptyCart.style.display = "flex";
      updateCartSummary();
      return;
    }

    cartItemsContainer.style.display = "flex";
    if (emptyCart) emptyCart.style.display = "none";

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100'">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-price">₹${item.price.toLocaleString()} each</p>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn minus" data-id="${item.id}" aria-label="Decrease">
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn plus" data-id="${item.id}" aria-label="Increase">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="cart-item-total">
          <p class="item-total-price">₹${(item.price * item.quantity).toLocaleString()}</p>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join("");

    cartItemsContainer.querySelectorAll(".quantity-btn.plus").forEach(btn => {
      btn.addEventListener("click", () => updateQuantity(btn.dataset.id, 1));
    });
    cartItemsContainer.querySelectorAll(".quantity-btn.minus").forEach(btn => {
      btn.addEventListener("click", () => updateQuantity(btn.dataset.id, -1));
    });
    cartItemsContainer.querySelectorAll(".cart-item-remove").forEach(btn => {
      btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
    });

    updateCartSummary();
  }

  function updateCartSummary() {
    const { subtotal, tax, shipping, total } = calculateTotals();
    const fmt = n => `₹${n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    const el = id => document.getElementById(id);
    if (el("subtotal")) el("subtotal").textContent = fmt(subtotal);
    if (el("tax")) el("tax").textContent = fmt(tax);
    if (el("shipping")) el("shipping").textContent = shipping === 0 ? "Free" : fmt(shipping);
    if (el("total")) el("total").textContent = fmt(total);
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    const span = toast.querySelector("span");
    if (span) span.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3000);
  }

  updateCartCount();
  renderCart();

  // ============================================
  // ADD TO CART BUTTONS
  // ============================================
  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      const name = this.dataset.name;
      const price = this.dataset.price;
      const image = this.dataset.image;
      if (!name || !price) return;

      addToCart(name, price, image);

      const originalHTML = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i> Added!';
      this.classList.add("added");
      this.disabled = true;

      setTimeout(() => {
        this.innerHTML = originalHTML;
        this.classList.remove("added");
        this.disabled = false;
      }, 2000);
    });
  });

  // ============================================
  // PRODUCT FILTER & SORT
  // ============================================
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortSelect = document.getElementById("sortSelect");
  const productsGrid = document.getElementById("productsGrid");
  const noResults = document.getElementById("noResults");

  function filterAndSortProducts() {
    if (!productsGrid) return;
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const category = categoryFilter ? categoryFilter.value : "all";
    const sortBy = sortSelect ? sortSelect.value : "default";
    const products = Array.from(productsGrid.querySelectorAll(".product-card"));
    let visibleCount = 0;

    products.forEach(product => {
      const name = (product.dataset.name || "").toLowerCase();
      const productCategory = product.dataset.category || "";
      const matchesSearch = !searchTerm || name.includes(searchTerm);
      const matchesCategory = category === "all" || productCategory === category;
      if (matchesSearch && matchesCategory) {
        product.style.display = "";
        visibleCount++;
      } else {
        product.style.display = "none";
      }
    });

    if (sortBy !== "default") {
      const visible = products.filter(p => p.style.display !== "none");
      visible.sort((a, b) => {
        if (sortBy === "price-low") return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        if (sortBy === "price-high") return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        if (sortBy === "name") return (a.dataset.name || "").localeCompare(b.dataset.name || "");
        return 0;
      });
      visible.forEach(p => productsGrid.appendChild(p));
    }

    if (noResults) noResults.style.display = visibleCount === 0 ? "flex" : "none";
  }

  if (searchInput) searchInput.addEventListener("input", filterAndSortProducts);
  if (categoryFilter) categoryFilter.addEventListener("change", filterAndSortProducts);
  if (sortSelect) sortSelect.addEventListener("change", filterAndSortProducts);

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      if (productsGrid) {
        productsGrid.className = this.dataset.view === "list" ? "products-list" : "products-grid";
      }
    });
  });

  // ============================================
  // CART PAGE
  // ============================================
  const clearCartBtn = document.getElementById("clearCartBtn");
  if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);

  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModal = document.getElementById("checkoutModal");
  const modalClose = document.getElementById("modalClose");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) { showToast("Your cart is empty!"); return; }
      const orderNum = Math.floor(100000 + Math.random() * 900000);
      const orderNumberEl = document.getElementById("orderNumber");
      if (orderNumberEl) orderNumberEl.textContent = orderNum;
      if (checkoutModal) checkoutModal.classList.add("show");
      setTimeout(() => {
        cart = [];
        updateCartCount();
        renderCart();
        localStorage.setItem("cart", JSON.stringify(cart));
      }, 500);
    });
  }

  if (modalClose) modalClose.addEventListener("click", () => checkoutModal && checkoutModal.classList.remove("show"));

  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
  });

  const promoBtn = document.getElementById("promoBtn");
  const promoInput = document.getElementById("promoInput");
  if (promoBtn) {
    promoBtn.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === "SAVE10") showToast("🎉 Promo SAVE10 applied! 10% off");
      else if (code === "") showToast("Please enter a promo code");
      else showToast("Invalid promo code. Try SAVE10");
    });
  }

  // ============================================
  // MOBILE MENU
  // ============================================
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.getElementById("navLinks");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

  function toggleMobileMenu(force) {
    if (!mobileMenuToggle || !navLinks) return;
    const shouldOpen = typeof force === 'boolean' ? force : !navLinks.classList.contains("active");
    mobileMenuToggle.classList.toggle("active", shouldOpen);
    navLinks.classList.toggle("active", shouldOpen);
    if (mobileMenuOverlay) mobileMenuOverlay.classList.toggle("active", shouldOpen);
    document.body.style.overflow = shouldOpen ? "hidden" : "";
  }

  if (mobileMenuToggle) mobileMenuToggle.addEventListener("click", () => toggleMobileMenu());
  if (mobileMenuOverlay) mobileMenuOverlay.addEventListener("click", () => toggleMobileMenu(false));

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (navLinks && navLinks.classList.contains("active")) toggleMobileMenu(false);
    });
  });

  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (href !== "/" && currentPath.startsWith(href))) {
      link.classList.add("active");
    }
  });

  // ============================================
  // NAVBAR SCROLL
  // ============================================
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  // ============================================
  // SCROLL TO TOP
  // ============================================
  const scrollToTopBtn = document.getElementById("scrollToTop");
  window.addEventListener("scroll", () => {
    if (scrollToTopBtn) scrollToTopBtn.classList.toggle("show", window.scrollY > 400);
  });
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ============================================
  // CONTACT FORM
  // ============================================
  const contactForm = document.getElementById("contactForm");
  const successModal = document.getElementById("successModal");
  const modalCloseSuccess = document.getElementById("modalCloseSuccess");
  const closeSuccessBtn = document.getElementById("closeSuccessBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (successModal) successModal.classList.add("show");
      contactForm.reset();
    });
  }

  if (modalCloseSuccess) modalCloseSuccess.addEventListener("click", () => successModal && successModal.classList.remove("show"));
  if (closeSuccessBtn) closeSuccessBtn.addEventListener("click", () => successModal && successModal.classList.remove("show"));

  // ============================================
  // SIGNUP FORM — validation only, POST handled by browser
  // ============================================
  const signupForm = document.getElementById("signupForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword");

  function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const strength = checkPasswordStrength(passwordInput.value);
      const fill = document.querySelector(".strength-fill");
      const text = document.querySelector(".strength-text");
      if (!fill || !text) return;
      const pct = (strength / 5) * 100;
      fill.style.width = pct + "%";
      const levels = [
        { max: 2, color: "#ef4444", label: "Weak" },
        { max: 3, color: "#f59e0b", label: "Fair" },
        { max: 4, color: "#10b981", label: "Good" },
        { max: 5, color: "#059669", label: "Strong" }
      ];
      const level = levels.find(l => strength <= l.max) || levels[3];
      fill.style.background = level.color;
      text.textContent = level.label;
      text.style.color = level.color;
    });
  }

  function togglePwVisibility(input, btn) {
    if (!input || !btn) return;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    const icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-eye", !isPassword);
      icon.classList.toggle("fa-eye-slash", isPassword);
    }
  }

  if (togglePasswordBtn) togglePasswordBtn.addEventListener("click", () => togglePwVisibility(passwordInput, togglePasswordBtn));
  if (toggleConfirmPasswordBtn) toggleConfirmPasswordBtn.addEventListener("click", () => togglePwVisibility(confirmPasswordInput, toggleConfirmPasswordBtn));

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      let valid = true;
      const pwErr = document.getElementById("passwordError");
      const cpErr = document.getElementById("confirmPasswordError");

      if (pwErr) pwErr.textContent = "";
      if (cpErr) cpErr.textContent = "";

      if (passwordInput && checkPasswordStrength(passwordInput.value) < 3) {
        if (pwErr) pwErr.textContent = "Password is too weak. Use 8+ characters with letters and numbers.";
        valid = false;
      }

      if (passwordInput && confirmPasswordInput && passwordInput.value !== confirmPasswordInput.value) {
        if (cpErr) cpErr.textContent = "Passwords do not match.";
        valid = false;
      }

      if (!valid) {
        e.preventDefault();
        return;
      }
      // valid = true → browser POSTs to /signup naturally
    });
  }

  // ============================================
  // STATS COUNTER
  // ============================================
  const statNumbers = document.querySelectorAll(".stat-number[data-target]");

  if (statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const duration = 1800;
          let start = null;
          function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString() + (progress < 1 ? "" : "+");
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNumbers.forEach(el => statsObserver.observe(el));
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const animatables = document.querySelectorAll(".feature-card, .category-card, .testimonial-card, .value-card, .team-card");

  if (animatables.length > 0) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    animatables.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      animObserver.observe(el);
    });
  }

  // ============================================
  // NEWSLETTER
  // ============================================
  const newsletterBtn = document.querySelector(".newsletter-btn");
  const newsletterInput = document.querySelector(".newsletter-input");

  if (newsletterBtn) {
    newsletterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (newsletterInput && newsletterInput.value.includes("@")) {
        showToast("🎉 Thanks for subscribing!");
        newsletterInput.value = "";
      } else {
        showToast("Please enter a valid email address");
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  console.log("✅ IndiaKart loaded successfully!");
});

// ============================================
// DARK / LIGHT THEME TOGGLE
// ============================================
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const savedTheme = localStorage.getItem("theme") || "light";
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    if (themeIcon) {
      if (isDark) themeIcon.classList.replace("fa-moon", "fa-sun");
      else themeIcon.classList.replace("fa-sun", "fa-moon");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}