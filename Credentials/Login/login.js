const usersString = localStorage.getItem("RegisteredUsersList");
const usersList = JSON.parse(usersString) || {};
const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const defaultHints = {
    email: "Use your registered email or username.",
    password: "Use 8+ characters with uppercase, lowercase, number, and special character.",
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

function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const loginEmailOrUsername = document.getElementById("email").value.trim().toLowerCase();

    const loginPassword = document.getElementById("password").value;
    const error = document.getElementById("error");

    form.classList.remove("is-success");
    resetFieldStates();

    const isEmail = emailRegex.test(loginEmailOrUsername);
    const isUsername = usernameRegex.test(loginEmailOrUsername);
    let isFormValid = true;

    if (!isEmail && !isUsername) {
        setFieldState("email", "error", "Enter a valid email address or a username with 3-16 letters, numbers, or underscore.");
        isFormValid = false;
    } else {
        setFieldState("email", "valid");
    }

    if (!passwordRegex.test(loginPassword)) {
        setFieldState("password", "error", "Password needs uppercase, lowercase, number, special character, and 8+ characters.");
        isFormValid = false;
    } else {
        setFieldState("password", "valid");
    }

    if (!isFormValid) {
        showError(error, "Please fix the highlighted field errors.");
        return;
    }

    let found = false;

    for (let user of Object.values(usersList)) {

        if (
            user.username.toLowerCase() === loginEmailOrUsername ||
            user.email.toLowerCase() === loginEmailOrUsername
        ) {
            error.style.display = "none";
            found = true;
            
            if (user.password === loginPassword) {
                localStorage.setItem("currentUser", JSON.stringify(user));
                error.innerText = "Login successful!";
                error.style.color = "#49d487";
                error.style.display = "block";
                form.classList.add("is-success");

                setTimeout(() => {
                    window.location.href = "../../index.html";
                }, 700);
            } else {
                setFieldState("password", "error", "Incorrect password for this account.");
                showError(error, "Incorrect Password");
                return
            }

            break;
        }

    }

    if (!found) {
        setFieldState("email", "error", "No account found with this email or username.");
        showError(error, "User not exist please Register");
    }
}
