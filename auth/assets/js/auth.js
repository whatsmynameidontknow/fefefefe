const checkLocalStorage = () => localStorage != null;

const BASE_API_URL = 'http://localhost:8080';
const BASE_AUTH_URL = `${BASE_API_URL}/auth`;
const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
};

const login = async (email, password) => {
    if (!checkLocalStorage()) {
        throw new Error('local storage not available!');
    }

    const response = await fetch(`${BASE_AUTH_URL}/login`, {
        headers: headers,
        body: JSON.stringify({
            email: email,
            password: password,
        }),
        method: 'POST',
    });
    if (response.ok) {
        localStorage.setItem('token', (await response.json()).content.token);
        return true;
    }
    return false;
};

const register = async (data) => {
    console.log(data);
    const response = await fetch(`${BASE_AUTH_URL}/register`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(data),
    });
    console.log(await response.json());
    if (response.ok) {
        return true;
    }
    return false;
};

const BASE_JOBS_URL = `${BASE_API_URL}/jobs`;
const getAllJobs = async () => {
    const response = await fetch(BASE_JOBS_URL);
    return await response.json();
};

const BASE_DEPARTMENTS_URL = `${BASE_API_URL}/departments`;
const getAllDepartments = async () => {
    const response = await fetch(BASE_DEPARTMENTS_URL);
    return await response.json();
};
