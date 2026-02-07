/**
 * API Client
 * Centralized axios/fetch wrapper for backend communication.
 */
const API_URL = '/api';

export const courseAPI = {
    getAll: (params) => { }, // with search/views logic
    getById: (id) => { },
    create: (data) => { },
    update: (id, data) => { },
};

export const lessonAPI = {
    upsert: (data) => { },
    delete: (id) => { },
};

export const quizAPI = {
    save: (data) => { },
    submitAttempt: (data) => { },
};
