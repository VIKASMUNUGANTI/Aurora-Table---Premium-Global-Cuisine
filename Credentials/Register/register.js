const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const defaultHints = {
    UserName: "Start with a letter. Use 3-16 letters, numbers, or underscore.",
    email: "Use a valid email address for account recovery.",
    Password: "Use 8+ characters with uppercase, lowercase, number, and special character.",
    confirmPassword: "Repeat the same password exactly.",
};

function showError(error, message) {
    error.innerText = message;
    error.style.color = "#ffb3a8";
    error.style.display = "block";
}

function setFieldState(inputId, status, message) {
    const input = document.getElementById(inputId);
    const field = input.closest(".field");
    const hint = field.querySelector(".input-hint");

    field.classList.remove("is-error", "is-valid");

    if (status) {
        field.classList.add(`is-${status}`);
    }

    hint.innerText = message || defaultHints[inputId];
}

function resetFieldStates() {
    Object.keys(defaultHints).forEach((inputId) => {
        setFieldState(inputId, "", defaultHints[inputId]);
    });
}

Object.keys(defaultHints).forEach((inputId) => {
    document.getElementById(inputId).addEventListener("input", () => {
        setFieldState(inputId, "", defaultHints[inputId]);
        document.querySelector(".form").classList.remove("is-success");
        document.getElementById("error").style.display = "none";
    });
});

function handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    let res = localStorage.getItem("RegisteredUsersList")
        ? JSON.parse(localStorage.getItem("RegisteredUsersList"))
        : {};

    const username = document.getElementById("UserName").value.trim();
    const password = document.getElementById("Password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const error = document.getElementById("error");
    const email = document.getElementById("email").value.trim().toLowerCase();
    let isFormValid = true;

    form.classList.remove("is-success");
    resetFieldStates();

    if (!usernameRegex.test(username)) {
        setFieldState("UserName", "error", "Username must start with a letter and be 3-16 characters. Use only letters, numbers, and underscore.");
        isFormValid = false;
    } else {
        setFieldState("UserName", "valid");
    }

    if (!emailRegex.test(email)) {
        setFieldState("email", "error", "Enter a valid email address.");
        isFormValid = false;
    } else if (res[email]) {
        setFieldState("email", "error", "This email is already registered. Please login.");
        isFormValid = false;
    } else {
        setFieldState("email", "valid");
    }

    if (!passwordRegex.test(password)) {
        setFieldState("Password", "error", "Password needs uppercase, lowercase, number, special character, and 8+ characters.");
        isFormValid = false;
    } else {
        setFieldState("Password", "valid");
    }

    if (password !== confirmPassword) {
        setFieldState("confirmPassword", "error", "Confirm password must match the password.");
        isFormValid = false;
    } else if (confirmPassword) {
        setFieldState("confirmPassword", "valid");
    }

    const usernameExists = Object.values(res).some(
        (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (usernameExists) {
        setFieldState("UserName", "error", "Username already exists. Please choose another username.");
        isFormValid = false;
    }

    if (!isFormValid) {
        showError(error, "Please fix the highlighted field errors.");
        return;
    }

    error.style.display = "none";

    const usersList = document.querySelectorAll("input");

    let emailKey = "";
    let userDetails = {};

    usersList.forEach((ele) => {
        if (ele.id.toLowerCase() === "email") {
            emailKey = ele.value.toLowerCase();
            userDetails[ele.id.toLowerCase()] = ele.value.toLowerCase();
        } else if (ele.id !== "confirmPassword") {
            userDetails[ele.id.toLowerCase()] = ele.value.trim();
        }
    });

    res[emailKey.toLowerCase()] = userDetails;

    localStorage.setItem(
        "RegisteredUsersList",
        JSON.stringify(res)
    );

    localStorage.setItem("currentUser", JSON.stringify(userDetails));
    error.innerText = "Registration successful!";
    error.style.color = "#49d487";
    error.style.display = "block";
    form.classList.add("is-success");

    setTimeout(() => {
        window.location.href = "/Credentials/Login/login.html";
    },200);
}
