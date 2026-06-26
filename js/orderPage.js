const orderContainer = document.getElementById("orderItems");
const orderSummary = document.getElementById("orderSummary");
const latestOrder = JSON.parse(localStorage.getItem("latestOrder")) || null;
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

if (!currentUser) {
  orderContainer.innerHTML = `
    <div class="empty-panel">
      <h2>Please login to view your order.</h2>
      <a class="btn primary" href="Credentials/Login/login.html">Login / Sign-up</a>
    </div>
  `;
  orderSummary.innerHTML = "";
} else if (
  !latestOrder ||
  !latestOrder.items?.length ||
  latestOrder.userEmail?.toLowerCase() !== currentUser.email?.toLowerCase()
) {
  orderContainer.innerHTML = `
    <div class="empty-panel">
      <h2>No recent order found.</h2>
      <a class="btn primary" href="menu.html">Reserve Dishes</a>
    </div>
  `;
  orderSummary.innerHTML = "";
} else {
  orderContainer.innerHTML = latestOrder.items.map((item) => {
    const quantity = item.quantity || 1;
    const total = Number(item.price * quantity).toFixed(2);

    return `
      <article class="order-item">
        <img src="${item.imageUrl}" alt="${item.foodName}">
        <div>
          <p class="eyebrow dark">${item.country} | ${item.course}</p>
          <h2>${item.foodName}</h2>
          <p>Quantity: ${quantity}</p>
          <strong>$${total}</strong>
        </div>
      </article>
    `;
  }).join("");

  orderSummary.innerHTML = `
    <span>Order #${latestOrder.id}</span>
    <strong>Final Amount: $${Number(latestOrder.total).toFixed(2)}</strong>
  `;
}
