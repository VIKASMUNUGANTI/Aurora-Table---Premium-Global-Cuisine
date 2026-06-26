function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser")) || null;
}

function logoutUser() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function renderAuthNavigation() {
  const authNav = document.querySelector("[data-auth-nav]");

  if (!authNav) return;

  const currentUser = getCurrentUser();

  if (!currentUser) {
    authNav.innerHTML = `
      <a href="cart.html">Cart</a>
      <a href="Credentials/Login/login.html">Login / Sign-up</a>
    `;
    return;
  }

  authNav.innerHTML = `
    <a href="cart.html">Cart</a>
    <span class="nav-user">${currentUser.username}</span>
    <button type="button" class="nav-logout" id="logoutButton">Logout</button>
  `;

  document.getElementById("logoutButton").addEventListener("click", logoutUser);
}

renderAuthNavigation();
