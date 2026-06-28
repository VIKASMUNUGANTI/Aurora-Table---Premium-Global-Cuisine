const ordersList = document.getElementById("ordersList");
const reservationRequestsList = document.getElementById("reservationRequestsList");
const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
const cancelTimeLimit = 30 * 60 * 1000;

function getStoredArray(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function formatDateTime(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isCurrentUserEmail(email) {
  return email?.toLowerCase() === currentUser?.email?.toLowerCase();
}

function canCancelOrder(order) {
  return Date.now() - new Date(order.createdAt || order.id).getTime() < cancelTimeLimit;
}

function getOrders() {
  const orders = getStoredArray("orders");
  const latestOrder = JSON.parse(localStorage.getItem("latestOrder")) || null;

  if (latestOrder && !orders.some((order) => String(order.id) === String(latestOrder.id))) {
    return [latestOrder, ...orders].filter((order) => isCurrentUserEmail(order.userEmail));
  }

  return orders.filter((order) => isCurrentUserEmail(order.userEmail));
}

function cancelOrder(orderId) {
  const orders = getStoredArray("orders").filter((order) => {
    const isSelectedOrder = String(order.id) === String(orderId);
    return !isSelectedOrder || !isCurrentUserEmail(order.userEmail);
  });
  const latestOrder = JSON.parse(localStorage.getItem("latestOrder")) || null;

  localStorage.setItem("orders", JSON.stringify(orders));

  if (
    latestOrder &&
    String(latestOrder.id) === String(orderId) &&
    isCurrentUserEmail(latestOrder.userEmail)
  ) {
    localStorage.removeItem("latestOrder");
  }

  renderOrders();
}

function renderOrders() {
  if (!currentUser) {
    ordersList.innerHTML = `
      <div class="empty-panel">
        <h2>Please login to view your orders.</h2>
        <a class="btn primary" href="Credentials/Login/login.html">Login / Sign-up</a>
      </div>
    `;
    return;
  }

  const orders = getOrders();

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-panel">
        <h2>No orders yet.</h2>
        <a class="btn primary" href="menu.html">Reserve Dishes</a>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = orders.map((order) => {
    const items = (order.items || []).map((item) => {
      const quantity = item.quantity || 1;
      return `<span>${escapeHtml(item.foodName)} x ${quantity}</span>`;
    }).join("");
    const canCancel = canCancelOrder(order);

    return `
      <article class="record-card">
        <div>
          <p class="eyebrow dark">Order #${order.id}</p>
          <h3>${escapeHtml(order.userEmail || "Your order")}</h3>
          <div class="record-meta">
            <span>Placed: ${formatDateTime(order.createdAt || order.id)}</span>
            <span>Items: ${(order.items || []).length}</span>
          </div>
          <div class="record-items">${items}</div>
        </div>
        <div class="record-actions">
          <strong class="record-total">$${Number(order.total || 0).toFixed(2)}</strong>
          ${canCancel ? `<button type="button" class="cancel-order-btn" data-id="${order.id}">Cancel Order</button>` : `<span class="cancel-expired">Cancel time expired</span>`}
        </div>
      </article>
    `;
  }).join("");

  orders.forEach((order) => {
    const timeLeft = cancelTimeLimit - (Date.now() - new Date(order.createdAt || order.id).getTime());

    if (timeLeft > 0) {
      setTimeout(renderOrders, timeLeft);
    }
  });
}

function renderReservationRequests() {
  if (!currentUser) {
    reservationRequestsList.innerHTML = `
      <div class="empty-panel">
        <h2>Please login to view reservation requests.</h2>
        <a class="btn primary" href="Credentials/Login/login.html">Login / Sign-up</a>
      </div>
    `;
    return;
  }

  const requests = getStoredArray("reservationRequests").filter((request) => isCurrentUserEmail(request.userEmail));

  if (requests.length === 0) {
    reservationRequestsList.innerHTML = `
      <div class="empty-panel">
        <h2>No reservation requests yet.</h2>
        <a class="btn primary" href="reservation.html">Request Reservation</a>
      </div>
    `;
    return;
  }

  reservationRequestsList.innerHTML = requests.map((request) => `
    <article class="record-card">
      <div>
        <p class="eyebrow dark">Request #${request.id}</p>
        <h3>${escapeHtml(request.fullName)}</h3>
        <div class="record-meta">
          <span>Email: ${escapeHtml(request.email)}</span>
          <span>Guests: ${escapeHtml(request.guests)}</span>
          <span>Date: ${escapeHtml(request.date)}</span>
          <span>Time: ${escapeHtml(request.time)}</span>
          <span>Dining: ${escapeHtml(request.preference)}</span>
          <span>Sent: ${formatDateTime(request.createdAt)}</span>
        </div>
      </div>
      <span class="status-pill">${escapeHtml(request.status || "Pending")}</span>
    </article>
  `).join("");
}

ordersList.addEventListener("click", (event) => {
  const cancelButton = event.target.closest(".cancel-order-btn");

  if (cancelButton) {
    cancelOrder(cancelButton.dataset.id);
  }
});

renderOrders();
renderReservationRequests();
