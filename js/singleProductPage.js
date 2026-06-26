const productContainer = document.getElementById("singleProductPage");

const selectedDish = JSON.parse(
  localStorage.getItem("SingleProductItemDetails")
);



if (selectedDish) {
  renderProduct(selectedDish);
}

document.getElementById("singleProductPage").style.background = `url("https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1800&q=85")`

function renderProduct(item) {
  productContainer.innerHTML = `
  
  
    <section class="dish-product-hero" >

      <div class="dish-product-copy">

        <span
          class="back-link"
          style="cursor:pointer"
          onclick="history.back()"
        >
          - Back to Menu
        </span>

        <p class="eyebrow">
          Signature Dish
        </p>

        <h1>
          ${item.foodName}
        </h1>

        <p>
          ${item.description}
        </p>

        <div class="product-meta">
          <span>Rating ${item.rating}</span>
          <span>Country: ${item.country}</span>
          <span>Course: ${item.course}</span>
          <span>Type: ${item.type}</span>
          <span>${item.category}</span>
        </div>

        <div class="product-actions">
          <strong>
            $${item.price}
          </strong>

          <button
            type="button"
            class="btn primary"
            id="reserveProduct"
          >
            Reserve This Dish
          </button>

          <a class="btn secondary" href="cart.html">
            View Cart
          </a>
        </div>

      </div>

      <div class="dish-product-visual">

        <img
          src="${item.imageUrl}"
          alt="${item.foodName}"
        >

        <div class="floating-price">
          $${item.price}
        </div>

      </div>

    </section>
  
  `;

  document
      .getElementById("reserveProduct")
      .addEventListener("click", () => {

          if (addDishToCart(item)) {
            showToast(`${item.foodName} added to cart!`);
            document.getElementById("reserveProduct").textContent = "Added";
          }
      });

  function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }
}

function getCartItems() {
  return JSON.parse(localStorage.getItem(getCartStorageKey())) || [];
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser")) || null;
}

function getCartStorageKey() {
  const currentUser = getCurrentUser();
  return currentUser?.email ? `cartItems:${currentUser.email.toLowerCase()}` : "cartItems:guest";
}

function requireLoggedInUser() {
  if (getCurrentUser()) {
    return true;
  }

  alert("Please login first to add dishes to your cart.");
  window.location.href = "Credentials/Login/login.html";
  return false;
}

function addDishToCart(selectedItem) {
  if (!requireLoggedInUser()) return false;

  const cartItems = getCartItems();
  const existingItem = cartItems.find(
    (item) => String(item.id) === String(selectedItem.id)
  );

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cartItems.push({ ...selectedItem, quantity: 1 });
  }

  localStorage.setItem(getCartStorageKey(), JSON.stringify(cartItems));
  return true;
}
