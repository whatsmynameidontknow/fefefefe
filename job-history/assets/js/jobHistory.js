const checkLocalStorage = () => localStorage != null;

let dataTable;
const initDataTable = () => {
    dataTable = new DataTable('#job-history-table', {
        pageLength: 5,
        order: [[3, 'desc']],
        lengthMenu: [5, 10, 15],
        language: {
            emptyTable: 'No data available',
        },
    });
};

initDataTable();

const getToken = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage not available!');
    }
    return localStorage.getItem('token');
};

const redirectUnauthenticated = () => {
    if (getToken() == null || getToken() == '') {
        window.location.href = '/auth/login.html';
    }
};

const BASE_API_URL = 'http://localhost:8080';
const BASE_EMPLOYEE_URL = `${BASE_API_URL}/employees`;
const headers = {
    Authorization: 'Bearer ' + getToken(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

const jobHistoryContainer = document.querySelector('#job-history-container');

const getJobHistoryByEmployeeId = async (employee_id) => {
    const response = await fetch(
        `${BASE_EMPLOYEE_URL}/${employee_id}?include_job_history=true`,
        {
            headers: headers,
        }
    );
    return await response.json();
};

const logout = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage unavailable!');
    }
    localStorage.removeItem('token');
    window.location.href = '/auth/login.html';
};

const renderJobHistory = (
    parentNode,
    jobHistory = [],
    filterFunc = (jh) => true
) => {
    parentNode.innerHTML = '';
    dataTable.clear();
    jobHistory.forEach((jh) => {
        if (filterFunc(jh)) {
            const jobHistoryRow = document.createElement('tr');
            jobHistoryRow.classList.add('text-center');

            const departmentName = document.createElement('td');
            departmentName.innerText = jh.department.department_name;
            const jobTitle = document.createElement('td');
            jobTitle.innerText = jh.job.job_title;
            const startDate = document.createElement('td');
            startDate.innerText = jh.start_date;
            const endDate = document.createElement('td');
            endDate.innerText = jh.end_date ?? 'Still working';

            jobHistoryRow.append(departmentName, jobTitle, startDate, endDate);
            dataTable.row.add(jobHistoryRow);
        }
    });
    dataTable.draw();
};
