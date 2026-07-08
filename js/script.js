// Welcome Button
const learnBtn = document.getElementById("learnBtn");
if (learnBtn) {
    learnBtn.addEventListener("click", function () {
        alert("Welcome to BuildBridge!\n\nThis Construction Project Management System helps manage Project Inquiries, Tasks, Contractor Assignments, and Daily Work Logs.");
    });
}

// Redirect or update navigation buttons based on login state
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("nav-buttons-container");
    if (container && auth.isLoggedIn()) {
        container.innerHTML = `
            <span style="color: white; margin-right: 15px; font-weight: 500;">Hi, ${auth.getUsername()}!</span>
            <a href="dashboard.html" class="btn login" style="background-color: var(--accent-color); color: #2c3e50;">Go to Dashboard</a>
            <button onclick="auth.logout()" class="btn register" style="background-color: transparent; border: 1px solid white;">Logout</button>
        `;
    }
});