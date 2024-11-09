import {
    deleteEmployee,
    getAllDepartments,
    getAllEmployees,
    getAllJobs,
    getEmployee,
    updateEmployee,
} from '../../../assets/js/api.js';
import { initDataTable } from '../../../assets/js/dataTable.js';
import { showToast } from '../../../assets/js/toast.js';

const dataTable = initDataTable('#employees-table');

const employeesContainer = document.querySelector('#employees-container');

const renderEmployees = (
    parentNode,
    employees = [],
    filterFunc = (employe) => true
) => {
    parentNode.innerHTML = '';
    dataTable.clear();
    employees.forEach((employee) => {
        if (filterFunc(employee)) {
            const employeeRow = document.createElement('tr');
            employeeRow.classList.add('text-center');
            const employeeId = document.createElement('td');
            employeeId.innerText = employee.employee_id;
            const fullName = document.createElement('td');
            fullName.innerText = `${employee.first_name} ${employee.last_name}`;
            const jobTitle = document.createElement('td');
            jobTitle.innerText = employee.job.job_title;
            const departmentName = document.createElement('td');
            departmentName.innerHTML = employee.department
                ? employee.department.department_name
                : 'N/A';

            const detailBtn = document.createElement('button');
            detailBtn.type = 'button';
            detailBtn.classList.add('btn', 'btn-success');
            detailBtn.setAttribute('data-bs-toggle', 'modal');
            detailBtn.setAttribute('data-bs-target', '#employee-modal');
            detailBtn.innerText = 'Detail';
            detailBtn.addEventListener('click', async () => {
                const employeeModalLabel = document.querySelector(
                    '#employee-modal-label'
                );
                employeeModalLabel.innerText = 'Employee Detail';
                const employeeModalContent = document.querySelector(
                    '#employee-modal-content'
                );
                employeeModalContent.innerHTML = '';
                try {
                    const res = await getEmployee(employee.employee_id);
                    renderEmployeeDetail(employeeModalContent, res);
                } catch (e) {
                    employeeModalContent.innerText = 'failed to get employee';
                }
            });

            const actionButton = document.createElement('td');
            actionButton.append(detailBtn);
            employeeRow.append(
                employeeId,
                fullName,
                jobTitle,
                departmentName,
                actionButton
            );
            dataTable.row.add(employeeRow);
        }
    });
    dataTable.draw();
};

const renderEmployeeDetail = async (parentNode, data) => {
    if (data.info.status != 200) {
        const notFound = document.createElement('h3');
        notFound.innerText = data.info.detailed_message;
        parentNode.append(notFound);
        return;
    }

    const employee = data.content;

    const employeeTable = document.createElement('table');

    const fullNameRow = document.createElement('tr');
    const fullNameLabel = document.createElement('th');
    fullNameLabel.innerText = 'Full Name';
    const fullNameContent = document.createElement('td');
    fullNameContent.innerText = `${employee.first_name} ${employee.last_name}`;
    fullNameRow.append(fullNameLabel, fullNameContent);

    const emailRow = document.createElement('tr');
    const emailLabel = document.createElement('th');
    emailLabel.innerText = 'Email';
    const emailContent = document.createElement('td');
    emailContent.innerText = employee.email;
    emailRow.append(emailLabel, emailContent);

    const phoneNumberRow = document.createElement('tr');
    const phoneNumberLabel = document.createElement('th');
    phoneNumberLabel.innerText = 'Phone Number';
    const phoneNumberContent = document.createElement('td');
    phoneNumberContent.innerText = employee.phone_number;
    phoneNumberRow.append(phoneNumberLabel, phoneNumberContent);

    const jobTitleRow = document.createElement('tr');
    const jobTitleLabel = document.createElement('th');
    jobTitleLabel.innerText = 'Job Title';
    const jobTitleContent = document.createElement('td');
    jobTitleContent.innerText = employee.job.job_title;
    jobTitleRow.append(jobTitleLabel, jobTitleContent);

    const departmentNameRow = document.createElement('tr');
    const departmentNameLabel = document.createElement('th');
    departmentNameLabel.innerText = 'Department Name';
    const departmentNameContent = document.createElement('td');
    departmentNameContent.innerHTML = employee.department
        ? employee.department.department_name
        : 'N/A';
    departmentNameRow.append(departmentNameLabel, departmentNameContent);

    const salaryRow = document.createElement('tr');
    const salaryLabel = document.createElement('th');
    salaryLabel.innerText = 'Salary';
    const salaryContent = document.createElement('td');
    salaryContent.innerText = employee.salary ?? 'N/A';
    salaryRow.append(salaryLabel, salaryContent);

    const hireDateRow = document.createElement('tr');
    const hireDateLabel = document.createElement('th');
    hireDateLabel.innerText = 'Hire Date';
    const hireDateContent = document.createElement('td');
    hireDateContent.innerText = employee.hire_date ?? 'N/A';
    hireDateRow.append(hireDateLabel, hireDateContent);

    const commissionPctRow = document.createElement('tr');
    const commissionPctLabel = document.createElement('th');
    commissionPctLabel.innerText = 'Commission Percentage';
    const commissionPctContent = document.createElement('td');
    if (employee.commission_pct) {
        const commissionPctFloat = parseFloat(employee.commission_pct);
        commissionPctContent.innerText = `${commissionPctFloat * 100}%`;
    } else {
        commissionPctContent.innerText = 'N/A';
    }
    commissionPctRow.append(commissionPctLabel, commissionPctContent);

    employeeTable.append(
        fullNameRow,
        emailRow,
        phoneNumberRow,
        jobTitleRow,
        departmentNameRow,
        salaryRow,
        hireDateRow,
        commissionPctRow
    );

    const employeeModalFooter = document.querySelector(
        '#employee-modal-footer'
    );
    employeeModalFooter.removeAttribute('hidden');
    employeeModalFooter.innerHTML = '';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-danger', 'col-md-5');
    deleteBtn.type = 'button';
    deleteBtn.innerText = 'Delete';
    deleteBtn.addEventListener('click', async () => {
        if (window.confirm('Are you sure?')) {
            const res = await deleteEmployee(employee.employee_id);
            showToast('employee-toast', {
                label: 'Delete employee',
                msg:
                    res.info.detailed_message ??
                    (res.info.status > 299
                        ? 'Failed to perform operation!'
                        : ''),
            });
            $(function () {
                $('#employee-modal').modal('toggle');
            });
            renderEmployees(employeesContainer, await getAllEmployees());
        }
    });

    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-primary', 'col-md-5');
    editBtn.type = 'button';
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', () => {
        renderUpdateForm(employee);
    });

    const jobHistoryBtn = document.createElement('button');
    jobHistoryBtn.classList.add('btn', 'btn-success', 'col-md-12');
    jobHistoryBtn.type = 'button';
    jobHistoryBtn.innerText = 'View Job History';
    jobHistoryBtn.addEventListener('click', () => {
        window.location.href = `/job-history/index.html?employee_id=${employee.employee_id}`;
    });

    employeeModalFooter.append(editBtn, deleteBtn, jobHistoryBtn);

    parentNode.append(employeeTable);
};

const renderUpdateForm = async (employee = {}) => {
    const modalLabel = document.querySelector('#employee-modal-label');
    modalLabel.innerText = 'Update Employee';

    const modalContent = document.querySelector('#employee-modal-content');
    modalContent.innerHTML = '';
    const form = document.createElement('form');

    const fullNameContainer = document.createElement('div');
    fullNameContainer.classList.add('row', 'mb-3');

    const firstNameContainer = document.createElement('div');
    firstNameContainer.classList.add('col');
    const firstNameLabel = document.createElement('label');
    firstNameLabel.setAttribute('for', 'first_name');
    firstNameLabel.classList.add('form-label');
    firstNameLabel.innerText = 'First Name';
    const firstNameInput = document.createElement('input');
    firstNameInput.type = 'text';
    firstNameInput.classList.add('form-control');
    firstNameInput.id = 'first_name';
    firstNameInput.name = 'first_name';
    firstNameInput.value = employee.first_name ?? '';
    firstNameInput.setAttribute('required', 'true');
    firstNameContainer.append(firstNameLabel, firstNameInput);

    const lastNameContainer = document.createElement('div');
    lastNameContainer.classList.add('col');
    const lastNameLabel = document.createElement('label');
    lastNameLabel.setAttribute('for', 'last_name');
    lastNameLabel.classList.add('form-label');
    lastNameLabel.innerText = 'Last Name';
    const lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.classList.add('form-control');
    lastNameInput.id = 'last_name';
    lastNameInput.name = 'last_name';
    lastNameInput.value = employee.last_name ?? '';
    lastNameInput.setAttribute('required', 'true');
    lastNameContainer.append(lastNameLabel, lastNameInput);

    fullNameContainer.append(firstNameContainer, lastNameContainer);

    const emailContainer = document.createElement('div');
    emailContainer.classList.add('mb-3');
    const emailLabel = document.createElement('label');
    emailLabel.setAttribute('for', 'email');
    emailLabel.classList.add('form-label');
    emailLabel.innerText = 'Email';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.classList.add('form-control');
    emailInput.id = 'email';
    emailInput.name = 'email';
    emailInput.value = employee.email ?? '';
    emailInput.setAttribute('required', 'true');
    emailContainer.append(emailLabel, emailInput);

    const phoneNumberContainer = document.createElement('div');
    phoneNumberContainer.classList.add('mb-3');
    const phoneNumberLabel = document.createElement('label');
    phoneNumberLabel.setAttribute('for', 'phone_number');
    phoneNumberLabel.classList.add('form-label');
    phoneNumberLabel.innerText = 'Phone Number';
    const phoneNumberInput = document.createElement('input');
    phoneNumberInput.type = 'tel';
    phoneNumberInput.classList.add('form-control');
    phoneNumberInput.id = 'phone_number';
    phoneNumberInput.name = 'phone_number';
    phoneNumberInput.value = employee.phone_number ?? '';
    phoneNumberInput.setAttribute('required', 'true');
    phoneNumberContainer.append(phoneNumberLabel, phoneNumberInput);

    const jobContainer = document.createElement('div');
    jobContainer.classList.add('mb-3');
    const jobLabel = document.createElement('label');
    jobLabel.setAttribute('for', 'job_list');
    jobLabel.classList.add('form-label');
    jobLabel.innerText = 'Job Title';
    const jobSelect = document.createElement('select');
    jobSelect.classList.add('form-select');
    jobSelect.id = 'job';
    let jobs = await getAllJobs();
    jobs.forEach((job) => {
        const jobOption = document.createElement('option');
        jobOption.value = job.job_id;
        jobOption.innerText = job.job_title;
        if (job.job_id === employee.job.job_id) {
            jobOption.setAttribute('selected', 'true');
        }
        jobSelect.appendChild(jobOption);
    });
    jobContainer.append(jobLabel, jobSelect);

    const departmentContainer = document.createElement('div');
    departmentContainer.classList.add('mb-3');
    const departmentLabel = document.createElement('label');
    departmentLabel.setAttribute('for', 'job_list');
    departmentLabel.classList.add('form-label');
    departmentLabel.innerText = 'Department Name';
    const departmentSelect = document.createElement('select');
    departmentSelect.classList.add('form-select');
    departmentSelect.id = 'department';
    const departments = await getAllDepartments();
    departments.forEach((department) => {
        const departmentOption = document.createElement('option');
        departmentOption.value = department.department_id;
        departmentOption.innerText = department.department_name;
        if (department.department_id === employee.department.department_id) {
            departmentOption.setAttribute('selected', 'true');
        }
        departmentSelect.appendChild(departmentOption);
    });
    departmentContainer.append(departmentLabel, departmentSelect);

    const salaryContainer = document.createElement('div');
    salaryContainer.classList.add('mb-3');
    const salaryLabel = document.createElement('label');
    salaryLabel.setAttribute('for', 'salary');
    salaryLabel.classList.add('form-label');
    salaryLabel.innerText = 'Salary';
    const salaryInput = document.createElement('input');
    salaryInput.type = 'number';
    salaryInput.classList.add('form-control');
    salaryInput.id = 'salary';
    salaryInput.min = 0;
    salaryInput.name = 'salary';
    salaryInput.value = employee.salary ?? 'N/A';
    salaryInput.setAttribute('required', 'true');
    salaryContainer.append(salaryLabel, salaryInput);

    const commissionPctContainer = document.createElement('div');
    commissionPctContainer.classList.add('mb-3');
    const commissionPctLabel = document.createElement('label');
    commissionPctLabel.setAttribute('for', 'commission_pct');
    commissionPctLabel.classList.add('form-label');
    commissionPctLabel.innerText = 'Commission Percentage';
    const commissionPctInput = document.createElement('input');
    commissionPctInput.type = 'number';
    commissionPctInput.classList.add('form-control');
    commissionPctInput.id = 'commission_pct';
    commissionPctInput.name = 'commission_pct';
    commissionPctInput.value = employee.commission_pct ?? '0';
    commissionPctInput.setAttribute('min', '0');
    commissionPctInput.setAttribute('max', '1');
    commissionPctInput.setAttribute('step', '0.01');
    commissionPctInput.setAttribute('required', 'true');
    commissionPctContainer.append(commissionPctLabel, commissionPctInput);

    const hireDateContainer = document.createElement('div');
    hireDateContainer.classList.add('mb-3');
    const hireDateLabel = document.createElement('label');
    hireDateLabel.setAttribute('for', 'hire_date');
    hireDateLabel.classList.add('form-label');
    hireDateLabel.innerText = 'Hire Date';
    const hireDateInput = document.createElement('input');
    hireDateInput.type = 'date';
    hireDateInput.classList.add('form-control');
    hireDateInput.id = 'hire_date';
    hireDateInput.name = 'hire_date';
    hireDateInput.max = new Date().toISOString().split('T')[0];
    hireDateInput.value = employee.hire_date ?? '';
    hireDateInput.setAttribute('required', 'true');
    hireDateContainer.append(hireDateLabel, hireDateInput);

    form.append(
        fullNameContainer,
        emailContainer,
        phoneNumberContainer,
        hireDateContainer,
        jobContainer,
        departmentContainer,
        salaryContainer,
        commissionPctContainer
    );

    modalContent.appendChild(form);

    const modalFooter = document.querySelector('#employee-modal-footer');
    modalFooter.innerHTML = '';
    const okBtn = document.createElement('button');
    okBtn.classList.add('btn', 'btn-primary', 'col-md-5');
    okBtn.innerText = 'Update';
    okBtn.addEventListener('click', async () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        employee = collectFormData(form, employee);
        const res = await updateEmployee(employee);
        showToast('employee-toast', {
            label: 'Update Employee',
            msg:
                res.info.detailed_message ??
                (res.info.status > 299 ? 'Failed to perform operation!' : ''),
        });
        $(function () {
            $('#employee-modal').modal('toggle');
        });
        renderEmployees(departmentContainer, await getAllEmployees());
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('btn', 'btn-secondary', 'col-md-5');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        $(function () {
            $('#employee-modal').modal('toggle');
        });
    });

    modalFooter.append(okBtn, cancelBtn);
};

const collectFormData = (form, old) => {
    old.first_name = form.first_name.value;
    old.last_name = form.last_name.value;
    old.email = form.email.value;
    old.phone_number = form.phone_number.value;
    old.job_id = form.job.value;
    old.department_id = parseInt(form.department.value);
    old.salary = parseInt(form.salary.value);
    old.commission_pct = parseFloat(form.commission_pct.value);
    old.hire_date = form.hire_date.value;
    return old;
};

export { renderEmployees };
