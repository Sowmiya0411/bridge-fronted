document.addEventListener("DOMContentLoaded", () => {
    const role = auth.getRole() || "CLIENT";
    const token = auth.getToken();

    const formSection = document.getElementById("assignment-form-section");
    const form = document.getElementById("assignmentForm");
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const message = document.getElementById("message");

    const navInquiries = document.getElementById("nav-inquiries");
    const navTasks = document.getElementById("nav-tasks");
    const navWorklogs = document.getElementById("nav-worklogs");

    let isEditing = false;
    let editingId = null;

    // UI Role Checks
    if (role === "CLIENT") {
        alert("Access Denied: Clients cannot view assignments.");
        window.location.href = "dashboard.html";
        return;
    } else if (role === "CONTRACTOR") {
        // Contractors can view assignments but not create or modify them
        if (formSection) formSection.style.display = "none";
        const actionsHeader = document.getElementById("actions-header");
        if (actionsHeader) actionsHeader.style.display = "none";
        
        if (navInquiries) navInquiries.style.display = "none";
    } else if (role === "SUPERVISOR") {
        // Supervisor sees everything
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const taskId = parseInt(document.getElementById("taskId").value);
            const contractorId = parseInt(document.getElementById("contractorId").value);
            const assignedDate = document.getElementById("assignedDate").value;
            const hourlyRate = parseFloat(document.getElementById("hourlyRate").value);
            const hoursAllocated = parseInt(document.getElementById("hoursAllocated").value);
            const status = document.getElementById("status").value;

            try {
                message.style.color = "blue";
                if (isEditing) {
                    message.innerText = "Updating assignment...";
                    
                    // PUT /api/assignments/{id} expects ContractorAssignment model:
                    // which uses nested objects: task: {id}, contractor: {id}
                    const putData = {
                        id: editingId,
                        task: { id: taskId },
                        contractor: { id: contractorId },
                        assignedDate: assignedDate,
                        hourlyRate: hourlyRate,
                        hoursAllocated: hoursAllocated,
                        status: status
                    };

                    await api.assignments.update(editingId, putData);
                    message.style.color = "green";
                    message.innerText = "Assignment Updated Successfully!";
                    resetForm();
                } else {
                    message.innerText = "Creating assignment...";
                    
                    // POST /api/assignments expects AssignmentRequestDto payload:
                    const postData = {
                        taskId: taskId,
                        contractorId: contractorId,
                        assignedDate: assignedDate,
                        hourlyRate: hourlyRate,
                        hoursAllocated: hoursAllocated,
                        status: status
                    };

                    await api.assignments.create(postData);
                    message.style.color = "green";
                    message.innerText = "Assignment Created Successfully!";
                    form.reset();
                }
                loadAssignments();
            } catch (error) {
                console.error(error);
                message.style.color = "red";
                message.innerText = error.message || "Failed to save assignment.";
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
        formTitle.textContent = "Assign Contractor to Task";
        submitBtn.textContent = "Create Assignment";
        cancelBtn.style.display = "none";
        document.getElementById("taskId").disabled = false;
        document.getElementById("contractorId").disabled = false;
    }

    async function loadAssignments() {
        try {
            const data = await api.assignments.getAll();
            renderTable(data);
        } catch (error) {
            console.error(error);
        }
    }

    function renderTable(data) {
        const tbody = document.querySelector("#assignmentTable tbody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${role === 'SUPERVISOR' ? 8 : 7}" style="text-align: center;">No assignments found.</td></tr>`;
            return;
        }

        data.forEach(asg => {
            const tr = document.createElement("tr");

            const rateFormatted = asg.hourlyRate ? `$${parseFloat(asg.hourlyRate).toFixed(2)}` : "N/A";
            const taskTitle = asg.task ? `ID: ${asg.task.id} - ${asg.task.title}` : "N/A";
            const taskIdVal = asg.task ? asg.task.id : 0;
            
            const contractorDisplay = asg.contractor ? `ID: ${asg.contractor.id} - ${asg.contractor.fullName}` : "N/A";
            const contractorIdVal = asg.contractor ? asg.contractor.id : 0;

            let actionsTd = "";
            if (role === "SUPERVISOR") {
                actionsTd = `
                    <td>
                        <div class="action-cell">
                            <button onclick="editAssignment(${asg.id}, ${taskIdVal}, ${contractorIdVal}, '${asg.assignedDate}', ${asg.hourlyRate}, ${asg.hoursAllocated}, '${asg.status}')" class="btn edit-btn">Edit</button>
                            <button onclick="deleteAssignment(${asg.id})" class="btn delete-btn">Delete</button>
                        </div>
                    </td>
                `;
            }

            tr.innerHTML = `
                <td>${asg.id}</td>
                <td><strong>${taskTitle}</strong></td>
                <td>${contractorDisplay}</td>
                <td>${asg.assignedDate || "N/A"}</td>
                <td>${rateFormatted}</td>
                <td>${asg.hoursAllocated || 0} hrs</td>
                <td><span class="badge status-${asg.status ? asg.status.toLowerCase() : 'active'}">${asg.status}</span></td>
                ${actionsTd}
            `;

            tbody.appendChild(tr);
        });
    }

    window.editAssignment = (id, taskId, contractorId, assignedDate, hourlyRate, hoursAllocated, status) => {
        isEditing = true;
        editingId = id;

        formTitle.textContent = "Edit Contractor Assignment (ID: " + id + ")";
        submitBtn.textContent = "Update Assignment";
        cancelBtn.style.display = "inline-block";

        document.getElementById("taskId").value = taskId;
        document.getElementById("contractorId").value = contractorId;
        document.getElementById("assignedDate").value = assignedDate;
        document.getElementById("hourlyRate").value = hourlyRate;
        document.getElementById("hoursAllocated").value = hoursAllocated;
        document.getElementById("status").value = status;

        formSection.scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteAssignment = async (id) => {
        if (!confirm("Are you sure you want to delete this contractor assignment?")) return;

        try {
            await api.assignments.delete(id);
            alert("Assignment deleted successfully!");
            loadAssignments();
        } catch (error) {
            console.error(error);
            alert("Error deleting assignment: " + error.message);
        }
    };

    loadAssignments();
});