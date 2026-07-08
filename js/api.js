const BASE_URL = 'https://bridge-backend-ddzr.onrender.com/api';

function getHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse(response) {
    if (!response.ok) {
        let errMsg = 'API Error';
        try {
            const txt = await response.text();
            errMsg = txt || response.statusText;
        } catch (e) {}
        throw new Error(errMsg);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    return await response.text();
}

window.api = {
    auth: {
        login: async (username, password) => {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return handleResponse(res);
        },
        register: async (username, email, password, fullName, role) => {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, fullName, role })
            });
            return handleResponse(res);
        }
    },
    inquiries: {
        create: async (clientId, data) => {
            const res = await fetch(`${BASE_URL}/inquiries?clientId=${clientId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse(res);
        },
        getMy: async (clientId) => {
            const res = await fetch(`${BASE_URL}/inquiries/my?clientId=${clientId}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        getAll: async () => {
            const res = await fetch(`${BASE_URL}/inquiries/all`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        assignContractor: async (inquiryId, contractorId) => {
            const res = await fetch(`${BASE_URL}/inquiries/${inquiryId}/assign?contractorId=${contractorId}`, {
                method: 'POST',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        updateStatus: async (inquiryId, status) => {
            const res = await fetch(`${BASE_URL}/inquiries/${inquiryId}/status?status=${status}`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        delete: async (inquiryId) => {
            const res = await fetch(`${BASE_URL}/inquiries/${inquiryId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return handleResponse(res);
        }
    },
    tasks: {
        create: async (data) => {
            const res = await fetch(`${BASE_URL}/tasks`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse(res);
        },
        getAll: async () => {
            const res = await fetch(`${BASE_URL}/tasks`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        getById: async (id) => {
            const res = await fetch(`${BASE_URL}/tasks/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        update: async (id, data) => {
            const res = await fetch(`${BASE_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse(res);
        },
        delete: async (id) => {
            const res = await fetch(`${BASE_URL}/tasks/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return handleResponse(res);
        }
    },
    assignments: {
        create: async (data) => {
            const res = await fetch(`${BASE_URL}/assignments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse(res);
        },
        getAll: async () => {
            const res = await fetch(`${BASE_URL}/assignments`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        getById: async (id) => {
            const res = await fetch(`${BASE_URL}/assignments/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        update: async (id, data) => {
            const res = await fetch(`${BASE_URL}/assignments/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse(res);
        },
        delete: async (id) => {
            const res = await fetch(`${BASE_URL}/assignments/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return handleResponse(res);
        }
    },
    logs: {
        create: async (data) => {
            const res = await fetch(`${BASE_URL}/logs`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse(res);
        },
        getAll: async () => {
            const res = await fetch(`${BASE_URL}/logs`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        getById: async (id) => {
            const res = await fetch(`${BASE_URL}/logs/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse(res);
        },
        update: async (id, data) => {
            const res = await fetch(`${BASE_URL}/logs/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return handleResponse(res);
        },
        delete: async (id) => {
            const res = await fetch(`${BASE_URL}/logs/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return handleResponse(res);
        }
    }
};
