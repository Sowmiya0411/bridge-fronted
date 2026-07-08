document.addEventListener("DOMContentLoaded", () => {
    const role = auth.getRole() || "CLIENT";
    const clientId = auth.getUserId();

    const formSection = document.getElementById("log-form-section");
    const form = document.getElementById("logForm");
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const message = document.getElementById("message");

    const navInquiries = document.getElementById("nav-inquiries");
    const navTasks = document.getElementById("nav-tasks");
    const navAssignments = document.getElementById("nav-assignments");

    let isEditing = false;
    let editingId = null;

    // Prefill Supervisor ID
    const supervisorInput = document.getElementById("supervisorId");
    if (supervisorInput) {
        supervisorInput.value =auth.getUserId;
    }

    // Role-based visibility controls
    if (role === "CLIENT") {
        if (formSection) formSection.style.display = "none";
        const actionsHeader = document.getElementById("actions-header");
        if (actionsHeader) actionsHeader.style.display = "none";

        if (navInquiries) navInquiries.style.display = "none";
        if (navTasks) navTasks.style.display = "none";
        if (navAssignments) navAssignments.style.display = "none";
    } else if (role === "CONTRACTOR") {
        // Contractors can view logs but not create/edit them
        if (formSection) formSection.style.display = "none";
        const actionsHeader = document.getElementById("actions-header");
        if (actionsHeader) actionsHeader.style.display = "none";

        if (navInquiries) navInquiries.style.display = "none";
    } else if (role === "SUPERVISOR") {
        // Supervisors have full edit/creation permissions
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const inquiryId = parseInt(document.getElementById("inquiryId").value);
            const logDate = document.getElementById("logDate").value;
            const laborCount = parseInt(document.getElementById("laborCount").value);
            const weatherCondition = document.getElementById("weatherCondition").value.trim();
            const progressIncrement = parseInt(document.getElementById("progressIncrement").value);
            const supervisorId = parseInt(document.getElementById("supervisorId").value);
            const notes = document.getElementById("notes").value.trim();

            const logPayload = {
                project: { id: inquiryId },
                supervisor: { id: supervisorId },
                logDate: logDate,
                laborCount: laborCount,
                weatherCondition: weatherCondition,
                progressIncrement: progressIncrement,
                notes: notes
            };

            try {
                message.style.color = "blue";
                if (isEditing) {
                    message.innerText = "Updating work log...";
                    logPayload.id = editingId;
                    await api.logs.update(editingId, logPayload);
                    message.style.color = "green";
                    message.innerText = "Work log updated successfully!";
                    resetForm();
                } else {
                    message.innerText = "Creating work log...";
                    await api.logs.create(logPayload);
                    message.style.color = "green";
                    message.innerText = "Work log created successfully!";
                    form.reset();
                    if (supervisorInput) supervisorInput.value = clientId; // Restore supervisor ID after reset
                }
                loadLogs();
            } catch (error) {
                console.error(error);
                message.style.color = "red";
                message.innerText = error.message || "Failed to save work log.";
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
        formTitle.textContent = "Create Daily Work Log";
        submitBtn.textContent = "Create Log";
        cancelBtn.style.display = "none";
        if (supervisorInput) supervisorInput.value = clientId;
    }

    async function loadLogs() {
        try {
            const data = await api.logs.getAll();
            renderTable(data);
        } catch (error) {
            console.error(error);
        }
    }

    function renderTable(data) {
        const tbody = document.querySelector("#logTable tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${role === 'SUPERVISOR' ? 9 : 8}" style="text-align: center;">No work logs found.</td></tr>`;
            return;
        }

        data.forEach(log => {
            const tr = document.createElement("tr");

            const siteName = log.project ? `ID: ${log.project.id} (${log.project.siteName})` : "N/A";
            const projectInquiryId = log.project ? log.project.id : 0;
            const supervisorName = log.supervisor ? `${log.supervisor.fullName} (ID: ${log.supervisor.id})` : "N/A";
            const supervisorIdVal = log.supervisor ? log.supervisor.id : 0;

            let actionsTd = "";
            if (role === "SUPERVISOR") {
                actionsTd = `
                    <td>
                        <div class="action-cell">
                            <button onclick="editLog(${log.id}, ${projectInquiryId}, '${log.logDate}', ${log.laborCount}, '${escapeHtml(log.weatherCondition)}', ${log.progressIncrement}, ${supervisorIdVal}, '${escapeHtml(log.notes || '')}')" class="btn edit-btn">Edit</button>
                            <button onclick="deleteLog(${log.id})" class="btn delete-btn">Delete</button>
                        </div>
                    </td>
                `;
            }

            tr.innerHTML = `
                <td>${log.id}</td>
                <td>${log.logDate || "N/A"}</td>
                <td><strong>${siteName}</strong></td>
                <td>${log.laborCount || 0} workers</td>
                <td>${log.weatherCondition || "N/A"}</td>
                <td><strong>+${log.progressIncrement || 0}%</strong></td>
                <td>${supervisorName}</td>
                <td><small>${log.notes || ""}</small></td>
                ${actionsTd}
            `;

            tbody.appendChild(tr);
        });
    }

    window.editLog = (id, projectInquiryId, logDate, laborCount, weatherCondition, progressIncrement, supervisorId, notes) => {
        isEditing = true;
        editingId = id;

        formTitle.textContent = "Edit Daily Work Log (ID: " + id + ")";
        submitBtn.textContent = "Update Log";
        cancelBtn.style.display = "inline-block";

        document.getElementById("inquiryId").value = projectInquiryId;
        document.getElementById("logDate").value = logDate;
        document.getElementById("laborCount").value = laborCount;
        document.getElementById("weatherCondition").value = weatherCondition;
        document.getElementById("progressIncrement").value = progressIncrement;
        document.getElementById("supervisorId").value = supervisorId;
        document.getElementById("notes").value = notes;

        formSection.scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteLog = async (id) => {
        if (!confirm("Are you sure you want to delete this work log?")) return;

        try {
            await api.logs.delete(id);
            alert("Work log deleted successfully!");
            loadLogs();
        } catch (error) {
            console.error(error);
            alert("Error deleting work log: " + error.message);
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

    loadLogs();
});
