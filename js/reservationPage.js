const reservationForm = document.getElementById("reservationForm");
const reservationMessage = document.getElementById("reservationMessage");

function getSavedReservations() {
  return JSON.parse(localStorage.getItem("reservationRequests")) || [];
}

function saveReservationRequest(request) {
  const requests = getSavedReservations();
  requests.unshift(request);
  localStorage.setItem("reservationRequests", JSON.stringify(requests));
}

reservationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(reservationForm);
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  const request = {
    id: Date.now(),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    date: formData.get("date"),
    time: formData.get("time"),
    guests: formData.get("guests"),
    preference: formData.get("preference"),
    userEmail: currentUser?.email || formData.get("email"),
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  saveReservationRequest(request);
  reservationForm.reset();
  reservationMessage.textContent = "Reservation request received. You can review it on the Orders page.";
});
