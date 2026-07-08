document.addEventListener("DOMContentLoaded", () => {
    const username = auth.getUsername() || "User";
    const role = auth.getRole() || "CLIENT";

    // Set display elements
    document.getElementById("user-display-name").textContent = username;
    
    const roleBadge = document.getElementById("user-role");
    roleBadge.textContent = role;
    roleBadge.className = `badge ${role.toLowerCase()}`;

    // Manage UI visibility based on roles
    const navInquiries = document.getElementById("nav-inquiries");
    const navTasks = document.getElementById("nav-tasks");
    const navAssignments = document.getElementById("nav-assignments");
    const navWorklogs = document.getElementById("nav-worklogs");

    const cardInquiry = document.getElementById("card-inquiry");
    const cardTasks = document.getElementById("card-tasks");
    const cardAssignments = document.getElementById("card-assignments");
    const cardWorklogs = document.getElementById("card-worklogs");

    if (role === "CLIENT") {
        // Clients can only submit or view inquiries
        if (navTasks) navTasks.style.display = "none";
        if (navAssignments) navAssignments.style.display = "none";
        if (navWorklogs) navWorklogs.style.display = "none";

        if (cardTasks) cardTasks.style.display = "none";
        if (cardAssignments) cardAssignments.style.display = "none";
        if (cardWorklogs) cardWorklogs.style.display = "none";
    } else if (role === "CONTRACTOR") {
        // Contractors view tasks, logs, and assignments, but not inquiry creation forms
        if (navInquiries) navInquiries.style.display = "none";
        if (cardInquiry) cardInquiry.style.display = "none";
    } else if (role === "SUPERVISOR") {
        // Supervisor sees everything
    }
});