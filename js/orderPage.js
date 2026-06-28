const orderContainer = document.getElementById("orderItems");
const orderSummary = document.getElementById("orderSummary");
const latestOrder = JSON.parse(localStorage.getItem("latestOrder")) || null;
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
const cancelTimeLimit = 30 * 60 * 1000;

function canCancelOrder(order) {
  return Date.now() - new Date(order.createdAt || order.id).getTime() < cancelTimeLimit;
}

function cancelLatestOrder() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const updatedOrders = orders.filter((order) => String(order.id) !== String(latestOrder.id));

  localStorage.setItem("orders", JSON.stringify(updatedOrders));
  localStorage.removeItem("latestOrder");
  window.location.href = "orders.html";
}

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
  const cancelAllowed = canCancelOrder(latestOrder);

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
    ${cancelAllowed ? `<button type="button" class="cancel-order-btn" id="cancelLatestOrder">Cancel Order</button>` : `<span class="cancel-expired">Cancel time expired</span>`}
  `;

  if (cancelAllowed) {
    document.getElementById("cancelLatestOrder").addEventListener("click", cancelLatestOrder);
    setTimeout(() => window.location.reload(), cancelTimeLimit - (Date.now() - new Date(latestOrder.createdAt || latestOrder.id).getTime()));
  }
}
