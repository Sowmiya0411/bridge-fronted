const form = document.getElementById("loginForm");
const message = document.getElementById("message");

// Redirect if already logged in
if (auth.isLoggedIn()) {
    window.location.href = "dashboard.html";
}

form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("username").value.trim();
    const passwordInput = document.getElementById("password").value;

    try {
        message.style.color = "blue";
        message.innerText = "Logging in...";

        const data = await api.auth.login(usernameInput, passwordInput);
        auth.saveSession(data);
        
        message.style.color = "green";
        message.innerText = "Login Successful!";
        alert("Login Successful");
        
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error(error);
        message.style.color = "red";
        message.innerText = error.message || "Invalid Username or Password";
    }
});