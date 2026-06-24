import { menuData } from "./menu_data.js";

const mainGrid = document.getElementById("mainGrid");
const searchResult = document.getElementById("searchResult");
const dishSearchText = document.getElementById("dishSearchText");
const countrySelect = document.getElementById("countrySelect");
const itemsCarts = document.getElementById("itemsCarts");
const filterToolTip = document.getElementById("filterToolTip");
const searchTool = document.getElementById("searchTool");
const cartShow = document.getElementById("cartShow");

if (mainGrid) {
  renderData(menuData);
  fillCountryFilter();
  renderCart();

  searchResult.addEventListener("click", getValue);

  searchTool.addEventListener("submit", (event) => {
    event.preventDefault();
    getValue();
  });

  // Product Page Navigation
  mainGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".menu-card");

    if (!card || event.target.closest(".reserve-btn")) {
      return;
    }

    const selectedDish = menuData.find(
      (item) => String(item.id) === card.dataset.id
    );

    if (!selectedDish) return;

    localStorage.setItem(
      "SingleProductItemDetails",
      JSON.stringify(selectedDish)
    );

    window.location.href = "singleproductpage.html";
  });

  // Add to Cart
  mainGrid.addEventListener("click", (event) => {
    const reserveButton = event.target.closest(".reserve-btn");

    if (!reserveButton) return;

    addDishToCart(reserveButton.dataset.id);

    reserveButton.textContent = "Added";

    setTimeout(() => {
      reserveButton.textContent = "Reserve Dish";
    }, 900);
  });

  // Delete Cart Item
  itemsCarts.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-btn");
    const quantityButton = event.target.closest(".quantity-btn");

    if (quantityButton) {
      updateCartQuantity(quantityButton.dataset.id, quantityButton.dataset.action);
      renderCart();
      return;
    }

    if (!deleteButton) return;

    removeDishFromCart(deleteButton.dataset.id);
    renderCart();
  });

  filterToolTip.addEventListener("click", toggleFilter);
  cartShow.addEventListener("click", dragCart);
}

function getValue() {
  const searchText = dishSearchText.value.toLowerCase();
  const selectedCountry = countrySelect.value.toLowerCase();

  const checkedTypes = [
    ...document.querySelectorAll('input[name="dishType"]:checked'),
  ].map((checkbox) => checkbox.value.toLowerCase());

  const filteredData = menuData.filter((item) => {
    const searchableFields = [
      item.country,
      item.category,
      item.course,
      item.description,
      item.foodName,
      String(item.price),
      item.type,
    ];

    const searchedData = searchableFields.some((field) =>
      String(field).toLowerCase().includes(searchText)
    );

    const countryMatch =
      selectedCountry === "" ||
      item.country.toLowerCase() === selectedCountry;

    const typeMatch =
      checkedTypes.length === 0 ||
      checkedTypes.includes(item.category.toLowerCase());

    return searchedData && countryMatch && typeMatch;
  });

  renderData(filteredData);
}

function fillCountryFilter() {
  const countries = new Set(menuData.map((item) => item.country));

  countries.forEach((country) => {
    countrySelect.innerHTML += `
      <option value="${country}">
        ${country}
      </option>
    `;
  });
}

function renderData(items) {
  mainGrid.innerHTML = "";

  if (items.length === 0) {
    mainGrid.innerHTML = `
      <h3 style="width:100%;text-align:center;color:orange">
        Sorry, no dishes found matching your criteria.
      </h3>
    `;
    return;
  }

  items.forEach((item) => {
    mainGrid.innerHTML += `
      <article class="menu-card" data-id="${item.id}">
        
        <div class="menu-card-image">
          <img src="${item.imageUrl}" alt="${item.foodName}">
          <span class="food-badge ${item.category}">
            ${item.category}
          </span>
        </div>

        <div class="menu-card-body">
          <div class="menu-card-top">
            <h3>${item.foodName}</h3>
            <strong>$${item.price}</strong>
          </div>

          <p>${item.description}</p>

          <div class="menu-card-meta">
            <span>Rating ${item.rating}</span>
            <span>Country: ${item.country}</span>
            <span>Course: ${item.course}</span>
            <span>Type: ${item.type}</span>
          </div>
        </div>

        <div class="reserveButton">
          <button class="reserve-btn" data-id="${item.id}">
            Reserve Dish
          </button>
        </div>

      </article>
    `;
  });
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

function createCartItem(item) {
  const quantity = item.quantity || 1;
  const total = Number(item.price * quantity).toFixed(2);

  return `
    <div class="cartItem" data-id="${item.id}">
    
      <div class="food">
        <img src="${item.imageUrl}" alt="${item.foodName}">
      </div>

      <div class="foodContent">

        <div class="foodName">
          <h3 style="font-size:20px;">${item.foodName}</h3>
        </div>

        <div class="insideContent">
          <div class="foodPrice">
            <h3 style="font-size:15px;">
              Price : $${item.price}
            </h3>
          </div>

          <div class="footQuantity"
          style="display:flex;font-size:15px;font-weight:600;">
            <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
            <div style="width:25px;text-align:center;">${quantity}</div>
            <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
        </div>

        <div class="bottom">

          <div class="totalPrice">
            <h3 style="font-size:15px;color:chocolate;">
              Total : $${total}
            </h3>
          </div>

          <div class="clearDish">
            <button class="delete-btn" data-id="${item.id}">
              Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}

function renderCart() {
  const currentUser = getCurrentUser();
  const cartItems = getCartItems();

  if (!currentUser) {
    itemsCarts.innerHTML = `<p class="cart-empty">Login to keep your own cart.</p>`;
    return;
  }

  if (cartItems.length === 0) {
    itemsCarts.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    return;
  }

  itemsCarts.innerHTML = cartItems.map(createCartItem).join("");
}

function addDishToCart(id) {
  if (!requireLoggedInUser()) return;

  const selectedItem = menuData.find(
    (item) => String(item.id) === String(id)
  );

  if (!selectedItem) return;

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
  renderCart();
}

function removeDishFromCart(id) {
  const updatedCartItems = getCartItems().filter(
    (item) => String(item.id) !== String(id)
  );

  localStorage.setItem(getCartStorageKey(), JSON.stringify(updatedCartItems));
}

function updateCartQuantity(id, action) {
  const cartItems = getCartItems();
  const selectedItem = cartItems.find(
    (item) => String(item.id) === String(id)
  );

  if (!selectedItem) return;

  if (action === "increase") {
    selectedItem.quantity = (selectedItem.quantity || 1) + 1;
  }

  if (action === "decrease") {
    selectedItem.quantity = (selectedItem.quantity || 1) - 1;
  }

  const updatedCartItems = cartItems.filter((item) => (item.quantity || 1) > 0);
  localStorage.setItem(getCartStorageKey(), JSON.stringify(updatedCartItems));
}

function toggleFilter() {
  if (
    searchTool.style.right === "" ||
    searchTool.style.right === "-400px"
  ) {
    searchTool.style.right = "0";
  } else {
    searchTool.style.right = "-400px";
  }
}

function dragCart() {
  if (
    itemsCarts.style.right === "" ||
    itemsCarts.style.right === "-400px"
  ) {
    itemsCarts.style.right = "0";
    document.getElementById("main").style.width = "74%";
    document.getElementById("site-header").style.width = "74%";
  } else {
    itemsCarts.style.right = "-400px";
    document.getElementById("main").style.width = "100%";
    document.getElementById("site-header").style.width = "100%";
  }
}
