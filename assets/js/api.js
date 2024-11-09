import {
    BASE_AUTH_URL,
    BASE_DEPARTMENTS_URL,
    BASE_EMPLOYEES_URL,
    BASE_JOBS_URL,
} from '../../../assets/js/constants.js';

const checkLocalStorage = () => localStorage != null;

const unprotectedHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
};

const removeToken = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage not available!');
    }
    localStorage.removeItem('token');
};

const getToken = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage not available!');
    }
    return localStorage.getItem('token');
};

const protectedHeaders = {
    ...unprotectedHeaders,
    Authorization: `Bearer ${getToken()}`,
};

const login = async (email, password) => {
    if (!checkLocalStorage()) {
        throw new Error('local storage not available!');
    }

    const response = await fetch(`${BASE_AUTH_URL}/login`, {
        headers: unprotectedHeaders,
        body: JSON.stringify({
            email: email,
            password: password,
        }),
        method: 'POST',
    });

    return await response.json();
};

const register = async (data) => {
    const response = await fetch(`${BASE_AUTH_URL}/register`, {
        headers: unprotectedHeaders,
        method: 'POST',
        body: JSON.stringify(data),
    });

    return await response.json();
};

const getAllEmployees = async () => {
    const response = await fetch(`${BASE_EMPLOYEES_URL}`, {
        headers: protectedHeaders,
    });
    if (response.ok) {
        return (await response.json()).content;
    }
    if (response.status === 403) {
        removeToken();
    }

    return [];
};

const deleteEmployee = async (id) => {
    const response = await fetch(`${BASE_EMPLOYEES_URL}/${id}`, {
        method: 'DELETE',
        headers: protectedHeaders,
    });
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const getEmployee = async (id, includeJobhistory = false) => {
    const response = await fetch(
        `${BASE_EMPLOYEES_URL}/${id}?include_job_history=${includeJobhistory}`,
        {
            headers: protectedHeaders,
        }
    );
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const updateEmployee = async (newData) => {
    const response = await fetch(
        `${BASE_EMPLOYEES_URL}/${newData.employee_id}`,
        {
            headers: protectedHeaders,
            body: JSON.stringify(newData),
            method: 'PATCH',
        }
    );
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const getAllDepartments = async () => {
    const response = await fetch(`${BASE_DEPARTMENTS_URL}`, {
        headers: unprotectedHeaders,
    });
    if (response.ok) {
        return (await response.json()).content;
    }

    return [];
};

const deleteDepartment = async (id) => {
    const response = await fetch(`${BASE_DEPARTMENTS_URL}/${id}`, {
        method: 'DELETE',
        headers: protectedHeaders,
    });
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const getDepartment = async (id) => {
    const response = await fetch(`${BASE_DEPARTMENTS_URL}/${id}`, {
        headers: unprotectedHeaders,
    });

    return await response.json();
};

const updateDepartment = async (newData) => {
    const response = await fetch(
        `${BASE_DEPARTMENTS_URL}/${newData.department_id}`,
        {
            headers: protectedHeaders,
            body: JSON.stringify(newData),
            method: 'PATCH',
        }
    );
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const createDepartment = async (data) => {
    const response = await fetch(BASE_DEPARTMENTS_URL, {
        headers: protectedHeaders,
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const getAllJobs = async () => {
    const response = await fetch(`${BASE_JOBS_URL}`, {
        headers: unprotectedHeaders,
    });
    if (response.ok) {
        return (await response.json()).content;
    }

    return [];
};

const deleteJob = async (id) => {
    const response = await fetch(`${BASE_JOBS_URL}/${id}`, {
        method: 'DELETE',
        headers: protectedHeaders,
    });
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const getJob = async (id) => {
    const response = await fetch(`${BASE_JOBS_URL}/${id}`, {
        headers: unprotectedHeaders,
    });

    return await response.json();
};

const updateJob = async (newData) => {
    const response = await fetch(`${BASE_JOBS_URL}/${newData.job_id}`, {
        headers: protectedHeaders,
        body: JSON.stringify(newData),
        method: 'PATCH',
    });
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

const createJob = async (data) => {
    const response = await fetch(BASE_JOBS_URL, {
        headers: protectedHeaders,
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (response.status === 403) {
        removeToken();
    }

    return await response.json();
};

export {
    createDepartment,
    createJob,
    deleteDepartment,
    deleteEmployee,
    deleteJob,
    getAllDepartments,
    getAllEmployees,
    getAllJobs,
    getDepartment,
    getEmployee,
    getJob,
    getToken,
    login,
    register,
    updateDepartment,
    updateEmployee,
    updateJob,
};
