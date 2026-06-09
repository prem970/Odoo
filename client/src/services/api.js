/**
 * API Client
 * Centralized axios/fetch wrapper for backend communication.
 */
const API_URL = '/api';

// Helper to handle response
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message);
    }
    return response.json();
};

// Helper for headers (simple version, auth token should be added via interceptor or here)
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const courseAPI = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/courses`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getForInstructor: async () => {
        const res = await fetch(`${API_URL}/courses/instructor`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getById: async (id) => {
        const res = await fetch(`${API_URL}/courses/${id}`, { headers: getHeaders() });
        return handleResponse(res);
    },
    create: async (data) => {
        const res = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    update: async (id, data) => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    delete: async (id) => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    togglePublish: async (id, published) => {
        const res = await fetch(`${API_URL}/courses/${id}/publish`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ published })
        });
        return handleResponse(res);
    },
    getAttendees: async (id) => {
        const res = await fetch(`${API_URL}/courses/${id}/attendees`, { headers: getHeaders() });
        return handleResponse(res);
    },
    addAttendee: async (id, email) => {
        const res = await fetch(`${API_URL}/courses/${id}/attendees`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email })
        });
        return handleResponse(res);
    },
    getEligibleLearners: async (id) => {
        const res = await fetch(`${API_URL}/courses/${id}/eligible-learners`, { headers: getHeaders() });
        return handleResponse(res);
    }
};

export const userAPI = {
    getProfile: async () => {
        const res = await fetch(`${API_URL}/user/profile`, { headers: getHeaders() });
        return handleResponse(res);
    },
    updateProfile: async (data) => {
        const res = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    changePassword: async (data) => {
        const res = await fetch(`${API_URL}/user/change-password`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    getInstructors: async () => {
        const res = await fetch(`${API_URL}/user/instructors`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getAll: async () => {
        const res = await fetch(`${API_URL}/user`, { headers: getHeaders() });
        return handleResponse(res);
    },
    delete: async (id) => {
        const res = await fetch(`${API_URL}/user/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    update: async (id, data) => {
        const res = await fetch(`${API_URL}/user/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    }
};

export const lessonAPI = {
    getByCourse: async (courseId) => {
        const res = await fetch(`${API_URL}/lessons/course/${courseId}`, { headers: getHeaders() });
        return handleResponse(res);
    },
    create: async (data) => {
        const res = await fetch(`${API_URL}/lessons`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    update: async (id, data) => {
        const res = await fetch(`${API_URL}/lessons/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    delete: async (id) => {
        const res = await fetch(`${API_URL}/lessons/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    reorder: async (lessons) => {
        const res = await fetch(`${API_URL}/lessons/reorder`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ lessons })
        });
        return handleResponse(res);
    }
};

export const quizAPI = {
    getById: async (id) => {
        const res = await fetch(`${API_URL}/quizzes/${id}`, { headers: getHeaders() });
        return handleResponse(res);
    },
    create: async (data) => {
        // data: { title, course_id }
        const res = await fetch(`${API_URL}/quizzes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    addQuestion: async (quizId, data) => {
        // data: { question, options: [{option_text, is_correct}] }
        const res = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    updateQuestion: async (questionId, data) => {
        const res = await fetch(`${API_URL}/quizzes/questions/${questionId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    deleteQuestion: async (questionId) => {
        const res = await fetch(`${API_URL}/quizzes/questions/${questionId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    updateRewards: async (quizId, data) => {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/rewards`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    save: async (data) => ({}),
    submitAttempt: async (data) => ({})
};
