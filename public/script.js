document.addEventListener("DOMContentLoaded", () => {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = document.querySelector(".cart-count");

  function updateCart() {
    if (cartCount) {
      cartCount.textContent = cart.length;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  updateCart();

  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      const image = btn.dataset.image;

      cart.push({ name, price, image });
      updateCart();

      btn.textContent = "Added ✓";
      setTimeout(() => {
        btn.textContent = "Add to Cart";
      }, 1000);
    });
  });

});
