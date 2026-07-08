// Auth management helper
const auth = {
    getToken: () => localStorage.getItem("token"),
    getUsername: () => localStorage.getItem("username"),
    getRole: () => localStorage.getItem("role"),
    getUserId: () => localStorage.getItem("userId"),

    saveSession: (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.id); // mapping user id to client id
    },

    clearSession: () => {
        localStorage.clear();
    },

    isLoggedIn: () => {
        return !!localStorage.getItem("token");
    },

    checkAuth: () => {
        if (!auth.isLoggedIn()) {
            window.location.href = "login.html";
        }
    },

    logout: () => {
        auth.clearSession();
        alert("Logout Successful");
        window.location.href = "login.html";
    }
};

// Check authentication for protected pages
if (window.location.pathname.endsWith("dashboard.html") ||
    window.location.pathname.endsWith("inquiry.html") ||
    window.location.pathname.endsWith("task.html") ||
    window.location.pathname.endsWith("assignment.html") ||
    window.location.pathname.endsWith("worklog.html")) {
    
    auth.checkAuth();
}

window.auth = auth;
