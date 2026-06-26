const cartContainer = document.getElementById("cartItems");
const orderButton = document.getElementById("placeOrder");
const cartSummary = document.getElementById("cartSummary");

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser")) || null;
}

function getCartStorageKey() {
  const currentUser = getCurrentUser();
  return currentUser?.email ? `cartItems:${currentUser.email.toLowerCase()}` : "cartItems:guest";
}

function getCartItems() {
  return JSON.parse(localStorage.getItem(getCartStorageKey())) || [];
}

function saveCartItems(items) {
  localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
}

function getCartTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0);
}

function renderCartPage() {
  const currentUser = getCurrentUser();
  const cartItems = getCartItems();

  if (!currentUser) {
    cartContainer.innerHTML = `
      <div class="empty-panel">
        <h2>Please login to view your reserved dishes.</h2>
        <a class="btn primary" href="Credentials/Login/login.html">Login / Sign-up</a>
      </div>
    `;
    cartSummary.innerHTML = "";
    orderButton.disabled = true;
    return;
  }

  if (cartItems.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-panel">
        <h2>Your cart is empty.</h2>
        <a class="btn primary" href="menu.html">Reserve Dishes</a>
      </div>
    `;
    cartSummary.innerHTML = "";
    orderButton.disabled = true;
    return;
  }

  cartContainer.innerHTML = cartItems.map((item) => {
    const quantity = item.quantity || 1;
    const total = Number(item.price * quantity).toFixed(2);

    return `
      <article class="cart-page-item">
        <img src="${item.imageUrl}" alt="${item.foodName}">
        <div class="cart-page-content">
          <div>
            <p class="eyebrow dark">${item.country} | ${item.course}</p>
            <h2>${item.foodName}</h2>
            <p>${item.description}</p>
          </div>
          <div class="cart-page-actions">
            <strong>$${item.price}</strong>
            <div class="quantity-control">
              <button type="button" class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
              <span>${quantity}</span>
              <button type="button" class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
            </div>
            <span class="line-total">$${total}</span>
            <button type="button" class="delete-btn" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  cartSummary.innerHTML = `
    <span>${cartItems.length} reserved dish${cartItems.length === 1 ? "" : "es"}</span>
    <strong>Final Amount: $${getCartTotal(cartItems).toFixed(2)}</strong>
  `;
  orderButton.disabled = false;
}

function updateCartQuantity(id, action) {
  const cartItems = getCartItems();
  const selectedItem = cartItems.find((item) => String(item.id) === String(id));

  if (!selectedItem) return;

  selectedItem.quantity = (selectedItem.quantity || 1) + (action === "increase" ? 1 : -1);
  saveCartItems(cartItems.filter((item) => (item.quantity || 1) > 0));
  renderCartPage();
}

function removeDishFromCart(id) {
  saveCartItems(getCartItems().filter((item) => String(item.id) !== String(id)));
  renderCartPage();
}

cartContainer.addEventListener("click", (event) => {
  const quantityButton = event.target.closest(".quantity-btn");
  const deleteButton = event.target.closest(".delete-btn");

  if (quantityButton) {
    updateCartQuantity(quantityButton.dataset.id, quantityButton.dataset.action);
    return;
  }

  if (deleteButton) {
    removeDishFromCart(deleteButton.dataset.id);
  }
});

orderButton.addEventListener("click", () => {
  const currentUser = getCurrentUser();
  const cartItems = getCartItems();

  if (!currentUser || cartItems.length === 0) return;

  const order = {
    id: Date.now(),
    userEmail: currentUser.email,
    items: cartItems,
    total: getCartTotal(cartItems),
  };

  localStorage.setItem("latestOrder", JSON.stringify(order));
  saveCartItems([]);
  window.location.href = "order.html";
});

renderCartPage();
