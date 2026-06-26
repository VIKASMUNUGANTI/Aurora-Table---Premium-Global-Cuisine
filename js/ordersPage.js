const ordersList = document.getElementById("ordersList");
const reservationRequestsList = document.getElementById("reservationRequestsList");

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

function getOrders() {
  const orders = getStoredArray("orders");
  const latestOrder = JSON.parse(localStorage.getItem("latestOrder")) || null;

  if (latestOrder && !orders.some((order) => String(order.id) === String(latestOrder.id))) {
    return [latestOrder, ...orders];
  }

  return orders;
}

function renderOrders() {
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

    return `
      <article class="record-card">
        <div>
          <p class="eyebrow dark">Order #${order.id}</p>
          <h3>${escapeHtml(order.userEmail || "Guest order")}</h3>
          <div class="record-meta">
            <span>Placed: ${formatDateTime(order.createdAt || order.id)}</span>
            <span>Items: ${(order.items || []).length}</span>
          </div>
          <div class="record-items">${items}</div>
        </div>
        <strong class="record-total">$${Number(order.total || 0).toFixed(2)}</strong>
      </article>
    `;
  }).join("");
}

function renderReservationRequests() {
  const requests = getStoredArray("reservationRequests");

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

renderOrders();
renderReservationRequests();
