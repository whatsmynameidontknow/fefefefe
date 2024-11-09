import {
    getAllDepartments,
    getAllJobs,
    getToken,
} from '../../../assets/js/api.js';
const checkLocalStorage = () => localStorage != null;

const isAuthenticated = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage unavailable!');
    }
    const token = localStorage.getItem('token');
    return token != null && token != '';
};

const setToken = (token) => {
    if (!checkLocalStorage()) {
        throw new Error('local storage unavailable!');
    }
    localStorage.setItem('token', token);
};

const logout = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage unavailable!');
    }
    localStorage.removeItem('token');
    window.location.href = '/auth/login.html';
};

const redirectUnauthenticated = () => {
    if (getToken() == null || getToken() == '') {
        window.location.href = '/auth/login.html';
    }
};

const populateJobList = async (parentNode) => {
    const jobs = await getAllJobs();
    jobs.forEach((job) => {
        const jobOption = document.createElement('option');
        jobOption.value = job.job_id;
        jobOption.innerText = job.job_title;
        parentNode.appendChild(jobOption);
    });
};

const populateDepartmentList = async (parentNode) => {
    const departments = await getAllDepartments();
    departments.forEach((department) => {
        const departmentOption = document.createElement('option');
        departmentOption.value = department.department_id;
        departmentOption.innerText = department.department_name;
        parentNode.appendChild(departmentOption);
    });
};

export {
    isAuthenticated,
    logout,
    populateDepartmentList,
    populateJobList,
    redirectUnauthenticated,
    setToken,
};
