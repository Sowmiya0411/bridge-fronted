document.addEventListener("DOMContentLoaded", () => {
    const role = auth.getRole() || "CLIENT";
    const clientId = auth.getClientId();
    
    // UI visibility adjustments based on role
    const createSection = document.getElementById("create-inquiry-section");
    const listTitle = document.getElementById("list-title");
    const navTasks = document.getElementById("nav-tasks");
    const navAssignments = document.getElementById("nav-assignments");
    const navWorklogs = document.getElementById("nav-worklogs");

    if (role === "CLIENT") {
        listTitle.textContent = "My Inquiries";
        if (navTasks) navTasks.style.display = "none";
        if (navAssignments) navAssignments.style.display = "none";
        if (navWorklogs) navWorklogs.style.display = "none";
    } else {
        // Supervisors and Contractors don't submit inquiries directly
        if (createSection) createSection.style.display = "none";
        listTitle.textContent = "All Project Inquiries";
        
        if (role === "CONTRACTOR") {
            // Contractors don't edit inquiries or assignments
            const actionsHeader = document.getElementById("actions-header");
            if (actionsHeader) actionsHeader.style.display = "none";
        }
    }

    const form = document.getElementById("inquiryForm");
    const message = document.getElementById("message");

    // Handle form submission (Client only)
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            const inquiryData = {
                siteName: document.getElementById("siteName").value.trim(),
                projectType: document.getElementById("projectType").value.trim(),
                location: document.getElementById("location").value.trim(),
                bhkCount: parseInt(document.getElementById("bhkCount").value),
                floorCount: parseInt(document.getElementById("floorCount").value),
                budget: parseFloat(document.getElementById("budget").value),
                duration: document.getElementById("duration").value.trim(),
                startDate: document.getElementById("startDate").value,
                endDate: document.getElementById("endDate").value
            };

            try {
                message.style.color = "blue";
                message.innerText = "Submitting inquiry...";
                
                await api.inquiries.create(clientId, inquiryData);
                
                message.style.color = "green";
                message.innerText = "Inquiry Created Successfully!";
                form.reset();
                loadInquiries();
            } catch (error) {
                console.error(error);
                message.style.color = "red";
                message.innerText = error.message || "Failed to Create Inquiry.";
            }
        });
    }

    // Load Inquiries
    async function loadInquiries() {
        const listMessage = document.getElementById("list-message");
        try {
            let data = [];
            if (role === "CLIENT") {
                data = await api.inquiries.getMy(clientId);
            } else {
                data = await api.inquiries.getAll();
            }

            renderTable(data);
        } catch (error) {
            console.error(error);
            if (listMessage) {
                listMessage.style.color = "red";
                listMessage.innerText = "Failed to load inquiries: " + error.message;
            }
        }
    }

    function renderTable(data) {
        const tbody = document.getElementById("inquiryTableBody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${role === 'CONTRACTOR' ? 7 : 8}" style="text-align: center;">No inquiries found.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const tr = document.createElement("tr");

            // Basic inquiry fields
            const budgetFormatted = item.budget ? `$${parseFloat(item.budget).toLocaleString()}` : "N/A";
            const dateRange = `${item.startDate || "N/A"} to ${item.endDate || "N/A"}`;

            let actionsTd = "";
            let statusTd = "";

            if (role === "SUPERVISOR") {
                // Status select dropdown
                const statuses = ["PENDING", "ASSIGNED", "REJECTED", "PLANING", "ACTIVE", "COMPLETED"];
                let options = "";
                statuses.forEach(s => {
                    options += `<option value="${s}" ${item.status === s ? 'selected' : ''}>${s}</option>`;
                });
                statusTd = `
                    <td>
                        <select onchange="updateInquiryStatus(${item.id}, this.value)" class="table-select">
                            ${options}
                        </select>
                    </td>
                `;

                // Assign contractor input/actions
                const contractorDisplay = item.contractor ? `ID: ${item.contractor.id} (${item.contractor.fullName})` : "";
                actionsTd = `
                    <td>
                        <div class="action-cell">
                            ${item.contractor 
                                ? `<span class="assigned-text">Assigned: ${contractorDisplay}</span>` 
                                : `
                                <div class="assign-group">
                                    <input type="number" id="contractorId-${item.id}" placeholder="Contractor ID" class="table-input">
                                    <button onclick="assignContractor(${item.id})" class="btn table-btn">Assign</button>
                                </div>
                                `
                            }
                            <button onclick="deleteInquiry(${item.id})" class="btn delete-btn">Delete</button>
                        </div>
                    </td>
                `;
            } else {
                statusTd = `<td><span class="badge ${item.status ? item.status.toLowerCase() : ''}">${item.status || "PENDING"}</span></td>`;
                if (role === "CLIENT") {
                    actionsTd = `
                        <td>
                            <button onclick="deleteInquiry(${item.id})" class="btn delete-btn">Delete</button>
                        </td>
                    `;
                }
            }

            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.siteName}</strong></td>
                <td>${item.projectType}</td>
                <td>${item.location}</td>
                <td>${budgetFormatted}</td>
                <td><small>${dateRange}</small></td>
                ${statusTd}
                ${actionsTd}
            `;

            tbody.appendChild(tr);
        });
    }

    // Global exposed action handlers
    window.assignContractor = async (id) => {
        const input = document.getElementById(`contractorId-${id}`);
        const contractorId = parseInt(input.value);
        if (isNaN(contractorId)) {
            alert("Please enter a valid Contractor User ID.");
            return;
        }

        try {
            await api.inquiries.assignContractor(id, contractorId);
            alert("Contractor assigned successfully!");
            loadInquiries();
        } catch (error) {
            console.error(error);
            alert("Error assigning contractor: " + error.message);
        }
    };

    window.updateInquiryStatus = async (id, status) => {
        try {
            await api.inquiries.updateStatus(id, status);
            alert("Status updated successfully!");
            loadInquiries();
        } catch (error) {
            console.error(error);
            alert("Error updating status: " + error.message);
        }
    };

    window.deleteInquiry = async (id) => {
        if (!confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            await api.inquiries.delete(id);
            alert("Inquiry deleted successfully!");
            loadInquiries();
        } catch (error) {
            console.error(error);
            alert("Error deleting inquiry: " + error.message);
        }
    };

    loadInquiries();
});