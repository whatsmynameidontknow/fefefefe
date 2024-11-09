const checkLocalStorage = () => localStorage != null;

let dataTable;
const initDataTable = () => {
    dataTable = new DataTable('#jobs-table', {
        pageLength: 5,
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
const BASE_JOBS_URL = `${BASE_API_URL}/jobs`;
const headers = {
    Authorization: 'Bearer ' + getToken(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

const jobsContainer = document.querySelector('#jobs-container');

const getAllJobs = async () => {
    const response = await fetch(`${BASE_JOBS_URL}`, {
        headers: headers,
    });
    if (response.ok) {
        return (await response.json()).content;
    }

    return [];
};

const deleteJob = async (id) => {
    const response = await fetch(`${BASE_JOBS_URL}/${id}`, {
        method: 'DELETE',
        headers: headers,
    });

    return await response.json();
};

const getJob = async (id) => {
    const response = await fetch(`${BASE_JOBS_URL}/${id}`, {
        headers: headers,
    });

    return await response.json();
};

const updateJob = async (newData) => {
    const response = await fetch(`${BASE_JOBS_URL}/${newData.job_id}`, {
        headers: headers,
        body: JSON.stringify(newData),
        method: 'PATCH',
    });
    return await response.json();
};

const createJob = async (data) => {
    const response = await fetch(BASE_JOBS_URL, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return await response.json();
};

const logout = () => {
    if (!checkLocalStorage()) {
        throw new Error('local storage unavailable!');
    }
    localStorage.removeItem('token');
    window.location.href = '/auth/login.html';
};

const renderJobs = (parentNode, jobs = [], filterFunc = (job) => true) => {
    parentNode.innerHTML = '';
    dataTable.clear();
    jobs.forEach((job) => {
        if (filterFunc(job)) {
            const jobRow = document.createElement('tr');
            jobRow.classList.add('text-center');

            const jobId = document.createElement('td');
            jobId.innerText = job.job_id;
            const jobTitle = document.createElement('td');
            jobTitle.innerText = job.job_title;

            const detailBtn = document.createElement('button');
            detailBtn.type = 'button';
            detailBtn.classList.add('btn', 'btn-success');
            detailBtn.setAttribute('data-bs-toggle', 'modal');
            detailBtn.setAttribute('data-bs-target', '#job-modal');
            detailBtn.innerText = 'Detail';
            detailBtn.addEventListener('click', async () => {
                console.log(`Querying ID ${job.job_id}`);
                const jobModallabel =
                    document.querySelector('#job-modal-label');
                jobModallabel.innerText = 'Job Detail';
                const jobModalContent =
                    document.querySelector('#job-modal-content');
                jobModalContent.innerHTML = '';
                try {
                    const res = await getJob(job.job_id);
                    renderJobDetail(jobModalContent, res);
                } catch (e) {
                    console.log(e);
                    jobModalContent.innerText = 'failed to get job';
                }
            });

            const actionButton = document.createElement('td');
            actionButton.append(detailBtn);
            jobRow.append(jobId, jobTitle, actionButton);
            dataTable.row.add(jobRow);
        }
    });
    dataTable.draw();
};

const renderJobDetail = async (parentNode, data) => {
    if (data.info.status != 200) {
        const notFound = document.createElement('h3');
        notFound.innerText = data.info.detailed_message;
        parentNode.append(notFound);
        return;
    }

    const job = data.content;

    const jobTable = document.createElement('table');

    const jobIdRow = document.createElement('tr');
    const jobIdLabel = document.createElement('th');
    jobIdLabel.innerText = 'Job ID';
    const jobIdContent = document.createElement('td');
    jobIdContent.innerText = job.job_id;
    jobIdRow.append(jobIdLabel, jobIdContent);

    const jobTitleRow = document.createElement('tr');
    const jobTitleLabel = document.createElement('th');
    jobTitleLabel.innerText = 'Job Title';
    const jobTitleContent = document.createElement('td');
    jobTitleContent.innerText = job.job_title;
    jobTitleRow.append(jobTitleLabel, jobTitleContent);

    const minSalaryRow = document.createElement('tr');
    const minSalaryLabel = document.createElement('th');
    minSalaryLabel.innerText = 'Minimum Salary';
    const minSalaryContent = document.createElement('td');
    minSalaryContent.innerText = job.min_salary ?? 'N/A';
    minSalaryRow.append(minSalaryLabel, minSalaryContent);

    const maxSalaryRow = document.createElement('tr');
    const maxSalaryLabel = document.createElement('th');
    maxSalaryLabel.innerText = 'Maximum Salary';
    const maxSalaryContent = document.createElement('td');
    maxSalaryContent.innerText = job.max_salary ?? 'N/A';
    maxSalaryRow.append(maxSalaryLabel, maxSalaryContent);

    jobTable.append(jobIdRow, jobTitleRow, minSalaryRow, maxSalaryRow);

    const jobModaLFooter = document.querySelector('#job-modal-footer');
    jobModaLFooter.removeAttribute('hidden');
    jobModaLFooter.innerHTML = '';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-danger', 'col-md-5');
    deleteBtn.type = 'button';
    deleteBtn.innerText = 'Delete';
    deleteBtn.addEventListener('click', async () => {
        if (window.confirm('Are you sure?')) {
            const res = await deleteJob(job.job_id);
            const toast = createToast({
                label: 'Delete job',
                msg: res.info.detailed_message,
            });
            document.body.appendChild(toast);
            $(function () {
                bootstrap.Toast.getOrCreateInstance(toast).show();
            });
            $(function () {
                $('#job-modal').modal('toggle');
            });
            renderJobs(jobsContainer, await getAllJobs());
        }
    });

    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-primary', 'col-md-5');
    editBtn.type = 'button';
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', () => {
        renderJobForm(job, {
            label: 'Update Job',
            okLabel: 'Update',
            withCancel: true,
            okFunc: updateJob,
        });
    });

    jobModaLFooter.append(editBtn, deleteBtn);

    parentNode.append(jobTable);
};

const createToast = ({ label, msg }) => {
    const toast = document.createElement('div');
    toast.classList.add('toast', 'position-absolute');
    toast.style.bottom = '8%';
    toast.style.right = '5%';
    toast.id = 'job-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomice', 'true');
    toast.innerHTML = `<div class="toast-header">
    <strong class="me-auto">${label}</strong>
    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
  <div class="toast-body">
    ${msg}
  </div>`;
    return toast;
};

const renderJobForm = async (
    job = {},
    { label, okLabel, okFunc, withCancel, withId }
) => {
    const modalLabel = document.querySelector('#job-modal-label');
    modalLabel.innerText = label;

    const modalContent = document.querySelector('#job-modal-content');
    modalContent.innerHTML = '';
    const form = document.createElement('form');

    if (withId) {
        const jobIdContainer = document.createElement('div');
        jobIdContainer.classList.add('mb-3');
        const jobIdLabel = document.createElement('label');
        jobIdLabel.setAttribute('for', 'job_id');
        jobIdLabel.classList.add('form-label');
        jobIdLabel.innerText = 'Job ID';
        const jobIdInput = document.createElement('input');
        jobIdInput.type = 'text';
        jobIdInput.classList.add('form-control');
        jobIdInput.id = 'job_id';
        jobIdInput.name = 'job_id';
        jobIdInput.setAttribute('required', 'true');
        jobIdContainer.append(jobIdLabel, jobIdInput);
        form.appendChild(jobIdContainer);
    }

    const jobTitleContainer = document.createElement('div');
    jobTitleContainer.classList.add('mb-3');
    const jobTitleLabel = document.createElement('label');
    jobTitleLabel.setAttribute('for', 'job_title');
    jobTitleLabel.classList.add('form-label');
    jobTitleLabel.innerText = 'Job Title';
    const jobTitleInput = document.createElement('input');
    jobTitleInput.type = 'text';
    jobTitleInput.classList.add('form-control');
    jobTitleInput.id = 'job_title';
    jobTitleInput.name = 'job_title';
    jobTitleInput.value = job.job_title ?? '';
    jobTitleInput.setAttribute('required', 'true');
    jobTitleContainer.append(jobTitleLabel, jobTitleInput);

    const minSalaryContainer = document.createElement('div');
    minSalaryContainer.classList.add('mb-3');
    const minSalaryLabel = document.createElement('label');
    minSalaryLabel.setAttribute('for', 'min_salary');
    minSalaryLabel.classList.add('form-label');
    minSalaryLabel.innerText = 'Minimum Salary';
    const minSalaryInput = document.createElement('input');
    minSalaryInput.type = 'number';
    minSalaryInput.min = 0;
    minSalaryInput.classList.add('form-control');
    minSalaryInput.id = 'min_salary';
    minSalaryInput.name = 'min_salary';
    minSalaryInput.value = job.min_salary ?? '';
    minSalaryContainer.append(minSalaryLabel, minSalaryInput);

    const maxSalaryContainer = document.createElement('div');
    maxSalaryContainer.classList.add('mb-3');
    const maxSalaryLabel = document.createElement('label');
    maxSalaryLabel.setAttribute('for', 'max_salary');
    maxSalaryLabel.classList.add('form-label');
    maxSalaryLabel.innerText = 'Maximum Salary';
    const maxSalaryInput = document.createElement('input');
    maxSalaryInput.type = 'number';
    maxSalaryInput.min = 0;
    maxSalaryInput.classList.add('form-control');
    maxSalaryInput.id = 'max_salary';
    maxSalaryInput.name = 'max_salary';
    maxSalaryInput.value = job.max_salary ?? '';
    maxSalaryContainer.append(maxSalaryLabel, maxSalaryInput);

    form.append(jobTitleContainer, minSalaryContainer, maxSalaryContainer);

    modalContent.appendChild(form);

    const modalFooter = document.querySelector('#job-modal-footer');
    modalFooter.innerHTML = '';
    const okBtn = document.createElement('button');
    okBtn.classList.add('btn', 'btn-primary', 'col-md-5');
    okBtn.innerText = okLabel;
    okBtn.addEventListener('click', async () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        job = collectFormData(form, job);
        const res = await okFunc(job);
        const toast = createToast({
            label: label,
            msg: res.info.detailed_message,
        });
        document.body.appendChild(toast);
        document.body.appendChild(toast);
        $(function () {
            bootstrap.Toast.getOrCreateInstance(toast).show();
        });
        $(function () {
            $('#job-modal').modal('toggle');
        });
        renderJobs(jobsContainer, await getAllJobs());
    });
    modalFooter.appendChild(okBtn);
    if (withCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('btn', 'btn-secondary', 'col-md-5');
        cancelBtn.innerText = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            $(function () {
                $('#job-modal').modal('toggle');
            });
        });
        modalFooter.appendChild(cancelBtn);
    }
};

const collectFormData = (form, old) => {
    try {
        old.job_id = form.job_id.value;
    } catch (e) {}
    old.job_title = form.job_title.value;
    old.min_salary = form.min_salary.value;
    old.max_salary = form.max_salary.value;
    return old;
};
