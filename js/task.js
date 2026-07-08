document.addEventListener("DOMContentLoaded", () => {
    const role = auth.getRole() || "CLIENT";
    const token = auth.getToken();

    const formSection = document.getElementById("task-form-section");
    const form = document.getElementById("taskForm");
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const message = document.getElementById("message");

    const navInquiries = document.getElementById("nav-inquiries");
    const navAssignments = document.getElementById("nav-assignments");
    const navWorklogs = document.getElementById("nav-worklogs");

    let isEditing = false;
    let editingId = null;

    // UI visibility adjustments
    if (role === "CLIENT") {
        if (formSection) formSection.style.display = "none";
        const actionsHeader = document.getElementById("actions-header");
        if (actionsHeader) actionsHeader.style.display = "none";
        
        if (navTasks) navTasks.style.display = "none"; // Client shouldn't see tasks nav
        if (navAssignments) navAssignments.style.display = "none";
        if (navWorklogs) navWorklogs.style.display = "none";
    } else if (role === "CONTRACTOR") {
        // Contractors can view tasks but not create/edit them
        if (formSection) formSection.style.display = "none";
        const actionsHeader = document.getElementById("actions-header");
        if (actionsHeader) actionsHeader.style.display = "none";

        if (navInquiries) navInquiries.style.display = "none";
    } else if (role === "SUPERVISOR") {
        // Supervisor sees everything
    }

    // Handle Form Submit (Create or Update)
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const statusVal = document.getElementById("status").value;
            const taskData = {
                title: document.getElementById("title").value.trim(),
                description: document.getElementById("description").value.trim(),
                priority: document.getElementById("priority").value,
                status: statusVal === "" ? null : statusVal,
                estimatedCost: parseFloat(document.getElementById("estimatedCost").value) || 0
            };

            // For creation, we need inquiryId
            const inquiryIdVal = parseInt(document.getElementById("inquiryId").value);
            if (!isEditing) {
                taskData.inquiryId = inquiryIdVal;
            }

            try {
                message.style.color = "blue";
                if (isEditing) {
                    message.innerText = "Updating task...";
                    // For PUT, task object properties are mapped directly
                    await api.tasks.update(editingId, taskData);
                    message.style.color = "green";
                    message.innerText = "Task Updated Successfully!";
                    resetForm();
                } else {
                    message.innerText = "Creating task...";
                    await api.tasks.create(taskData);
                    message.style.color = "green";
                    message.innerText = "Task Created Successfully!";
                    form.reset();
                }
                loadTasks();
            } catch (error) {
                console.error(error);
                message.style.color = "red";
                message.innerText = error.message || "Failed to process task.";
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            resetForm();
        });
    }

    function resetForm() {
        isEditing = false;
        editingId = null;
        form.reset();
        formTitle.textContent = "Create Construction Task";
        submitBtn.textContent = "Create Task";
        cancelBtn.style.display = "none";
        document.getElementById("inquiryId").disabled = false;
    }

    // Load tasks list
    async function loadTasks() {
        try {
            const data = await api.tasks.getAll();
            renderTable(data);
        } catch (error) {
            console.error(error);
        }
    }

    function renderTable(data) {
        const tbody = document.querySelector("#taskTable tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${role === 'SUPERVISOR' ? 7 : 6}" style="text-align: center;">No tasks found.</td></tr>`;
            return;
        }

        data.forEach(task => {
            const tr = document.createElement("tr");

            // Cost formatting
            const costFormatted = task.estimatedCost ? `$${parseFloat(task.estimatedCost).toLocaleString()}` : "$0";
            
            // Project inquiry display
            const inquiryDisplay = task.project ? `ID: ${task.project.id} (${task.project.siteName})` : "N/A";
            const inquiryIdOnly = task.project ? task.project.id : "N/A";

            let actionsTd = "";
            if (role === "SUPERVISOR") {
                actionsTd = `
                    <td>
                        <div class="action-cell">
                            <button onclick="editTask(${task.id}, '${escapeHtml(task.title)}', '${escapeHtml(task.description || '')}', '${task.priority}', '${task.status || ''}', ${task.estimatedCost || 0}, ${inquiryIdOnly})" class="btn edit-btn">Edit</button>
                            <button onclick="deleteTask(${task.id})" class="btn delete-btn">Delete</button>
                        </div>
                    </td>
                `;
            }

            tr.innerHTML = `
                <td>${task.id}</td>
                <td><strong>${task.title}</strong><br><small class="text-muted">${task.description || ''}</small></td>
                <td>${inquiryDisplay}</td>
                <td><span class="badge priority-${task.priority ? task.priority.toLowerCase() : 'low'}">${task.priority}</span></td>
                <td><span class="badge status-${task.status ? task.status.toLowerCase() : 'pending'}">${task.status || 'N/A'}</span></td>
                <td>${costFormatted}</td>
                ${actionsTd}
            `;

            tbody.appendChild(tr);
        });
    }

    // Edit handler (populates form)
    window.editTask = (id, title, description, priority, status, estimatedCost, inquiryId) => {
        isEditing = true;
        editingId = id;

        formTitle.textContent = "Edit Construction Task (ID: " + id + ")";
        submitBtn.textContent = "Update Task";
        cancelBtn.style.display = "inline-block";

        document.getElementById("taskId").value = id;
        document.getElementById("inquiryId").value = inquiryId;
        document.getElementById("inquiryId").disabled = true; // Cannot re-link inquiry once created
        document.getElementById("title").value = title;
        document.getElementById("description").value = description;
        document.getElementById("priority").value = priority;
        document.getElementById("status").value = status || "";
        document.getElementById("estimatedCost").value = estimatedCost;

        // Scroll to form
        formSection.scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteTask = async (id) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await api.tasks.delete(id);
            alert("Task deleted successfully!");
            loadTasks();
        } catch (error) {
            console.error(error);
            alert("Error deleting task: " + error.message);
        }
    };

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadTasks();
});