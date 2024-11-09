import {
    deleteJob,
    getAllJobs,
    getJob,
    updateJob,
} from '../../../assets/js/api.js';
import { initDataTable } from '../../../assets/js/dataTable.js';
import { showToast } from '../../../assets/js/toast.js';

const dataTable = initDataTable('#jobs-table');

initDataTable();

const jobsContainer = document.querySelector('#jobs-container');

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
            showToast('job-toast', {
                label: 'Delete job',
                msg:
                    res.info.detailed_message ??
                    (res.info.status > 299
                        ? 'Failed to perform operation!'
                        : ''),
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
    minSalaryInput.required = true;
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
    maxSalaryInput.required = true;
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
        if (parseInt(maxSalaryInput.value) < parseInt(minSalaryInput.value)) {
            showToast('job-toast', {
                label: 'Create Job',
                msg: "Max salary can't be less than min salary!",
            });
            return;
        }
        job = collectFormData(form, job);
        const res = await okFunc(job);
        showToast('job-toast', {
            label: label,
            msg:
                res.info.detailed_message ??
                (res.info.status > 299 ? 'Failed to perform operation!' : ''),
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
    if (form.job_id) {
        old.job_id = form.job_id.value;
    }
    old.job_title = form.job_title.value;
    old.min_salary = form.min_salary.value;
    old.max_salary = form.max_salary.value;
    return old;
};

export { renderJobForm, renderJobs };
