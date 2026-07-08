const form = document.getElementById("registerForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!role) {
        message.style.color = "red";
        message.innerText = "Please select a role";
        return;
    }

    try {
        message.style.color = "blue";
        message.innerText = "Registering account...";

        await api.auth.register(username, email, password, fullName, role);

        message.style.color = "green";
        message.innerText = "Registration Successful!";
        alert("Registration Successful!");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        console.error(error);
        message.style.color = "red";
        message.innerText = error.message || "Registration Failed";
    }
});