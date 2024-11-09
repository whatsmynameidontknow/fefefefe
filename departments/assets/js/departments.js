import {
    deleteDepartment,
    getAllDepartments,
    getAllEmployees,
    getDepartment,
    updateDepartment,
} from '../../../assets/js/api.js';

let dataTable;
const initDataTable = () => {
    dataTable = new DataTable('#departments-table', {
        pageLength: 5,
        lengthMenu: [5, 10, 15],
        language: {
            emptyTable: 'No data available',
        },
    });
};

initDataTable();

const departmentsContainer = document.querySelector('#departments-container');

const renderDepartments = (
    parentNode,
    departments = [],
    filterFunc = (department) => true
) => {
    parentNode.innerHTML = '';
    dataTable.clear();
    departments.forEach((department) => {
        if (filterFunc(department)) {
            const departmentRow = document.createElement('tr');
            departmentRow.classList.add('text-center');

            const departmentId = document.createElement('td');
            departmentId.innerText = department.department_id;
            const departmentName = document.createElement('td');
            departmentName.innerText = department.department_name;

            const detailBtn = document.createElement('button');
            detailBtn.type = 'button';
            detailBtn.classList.add('btn', 'btn-success');
            detailBtn.setAttribute('data-bs-toggle', 'modal');
            detailBtn.setAttribute('data-bs-target', '#department-modal');
            detailBtn.innerText = 'Detail';
            detailBtn.addEventListener('click', async () => {
                console.log(`Querying ID ${department.department_id}`);
                const departmentModalLabel = document.querySelector(
                    '#department-modal-label'
                );
                departmentModalLabel.innerText = 'Department Detail';
                const departmentModalContent = document.querySelector(
                    '#department-modal-content'
                );
                departmentModalContent.innerHTML = '';
                try {
                    const res = await getDepartment(department.department_id);
                    renderDepartmentDetail(departmentModalContent, res);
                } catch (e) {
                    console.log(e);
                    departmentModalContent.innerText =
                        'failed to get department';
                }
            });

            const actionButton = document.createElement('td');
            actionButton.append(detailBtn);
            departmentRow.append(departmentId, departmentName, actionButton);
            dataTable.row.add(departmentRow);
        }
    });
    dataTable.draw();
};

const renderDepartmentDetail = async (parentNode, data) => {
    if (data.info.status != 200) {
        const notFound = document.createElement('h3');
        notFound.innerText = data.info.detailed_message;
        parentNode.append(notFound);
        return;
    }

    const department = data.content;

    const departmentTable = document.createElement('table');

    const departmentIdRow = document.createElement('tr');
    const departmentIdLabel = document.createElement('th');
    departmentIdLabel.innerText = 'Deprtment ID';
    const departmentIdContent = document.createElement('td');
    departmentIdContent.innerText = department.department_id;
    departmentIdRow.append(departmentIdLabel, departmentIdContent);

    const departmentNameRow = document.createElement('tr');
    const departmentNameLabel = document.createElement('th');
    departmentNameLabel.innerText = 'Department Name';
    const departmentNameContent = document.createElement('td');
    departmentNameContent.innerText = department.department_name;
    departmentNameRow.append(departmentNameLabel, departmentNameContent);

    const managerRow = document.createElement('tr');
    const managerLabel = document.createElement('th');
    managerLabel.innerText = 'Manager';
    const managerContent = document.createElement('td');
    if (department.manager) {
        managerContent.innerText = `${department.manager.first_name} ${department.manager.last_name}`;
    } else {
        managerContent.innerText = 'N/A';
    }
    managerRow.append(managerLabel, managerContent);

    const locationIdRow = document.createElement('tr');
    const locationIdLabel = document.createElement('th');
    locationIdLabel.innerText = 'Location ID';
    const locationIdContent = document.createElement('td');
    locationIdContent.innerText = department.location_id ?? 'N/A';
    locationIdRow.append(locationIdLabel, locationIdContent);

    departmentTable.append(
        departmentIdRow,
        departmentNameRow,
        managerRow,
        locationIdRow
    );

    const departmentModalFooter = document.querySelector(
        '#department-modal-footer'
    );
    departmentModalFooter.removeAttribute('hidden');
    departmentModalFooter.innerHTML = '';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-danger', 'col-md-5');
    deleteBtn.type = 'button';
    deleteBtn.innerText = 'Delete';
    deleteBtn.addEventListener('click', async () => {
        if (window.confirm('Are you sure?')) {
            const res = await deleteDepartment(department.department_id);
            const toast = createToast({
                label: 'Delete department',
                msg: res.info.detailed_message,
            });
            document.body.appendChild(toast);
            $(function () {
                bootstrap.Toast.getOrCreateInstance(toast).show();
            });
            $(function () {
                $('#department-modal').modal('toggle');
            });
            renderDepartments(departmentsContainer, await getAllDepartments());
        }
    });

    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-primary', 'col-md-5');
    editBtn.type = 'button';
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', () => {
        renderDepartmentForm(department, {
            label: 'Update Department',
            okLabel: 'Update',
            withCancel: true,
            okFunc: updateDepartment,
        });
    });

    departmentModalFooter.append(editBtn, deleteBtn);

    parentNode.append(departmentTable);
};

const createToast = ({ label, msg }) => {
    const toast = document.createElement('div');
    toast.classList.add('toast', 'position-absolute');
    toast.style.bottom = '8%';
    toast.style.right = '5%';
    toast.id = 'department-toast';
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

const renderDepartmentForm = async (
    department = {},
    { label, okLabel, okFunc, withCancel }
) => {
    const modalLabel = document.querySelector('#department-modal-label');
    modalLabel.innerText = label;

    const modalContent = document.querySelector('#department-modal-content');
    modalContent.innerHTML = '';
    const form = document.createElement('form');

    const departmentNameContainer = document.createElement('div');
    departmentNameContainer.classList.add('mb-3');
    const departmentNameLabel = document.createElement('label');
    departmentNameLabel.setAttribute('for', 'department_name');
    departmentNameLabel.classList.add('form-label');
    departmentNameLabel.innerText = 'Department Name';
    const departmentNameInput = document.createElement('input');
    departmentNameInput.type = 'text';
    departmentNameInput.classList.add('form-control');
    departmentNameInput.id = 'department_name';
    departmentNameInput.name = 'department_name';
    departmentNameInput.value = department.department_name ?? '';
    departmentNameInput.setAttribute('required', 'true');
    departmentNameContainer.append(departmentNameLabel, departmentNameInput);

    const managerContainer = document.createElement('div');
    managerContainer.classList.add('mb-3');
    const managerLabel = document.createElement('label');
    managerLabel.setAttribute('for', 'manager_id');
    managerLabel.classList.add('form-label');
    managerLabel.innerText = 'Manager ID';
    const managerSelect = document.createElement('select');
    const noManager = document.createElement('option');
    noManager.innerText = 'No Manager';
    noManager.value = '';
    managerSelect.id = 'manager_id';
    managerSelect.appendChild(noManager);
    managerSelect.classList.add('form-select');
    const employees = await getAllEmployees();
    employees.forEach((employee) => {
        const managerOpt = document.createElement('option');
        managerOpt.value = employee.employee_id;
        managerOpt.innerText = `${employee.first_name} ${employee.last_name}`;
        if (
            department.manager != null &&
            department.manager.employee_id == employee.employee_id
        ) {
            managerOpt.setAttribute('selected', 'true');
        }
        managerSelect.appendChild(managerOpt);
    });

    managerContainer.append(managerLabel, managerSelect);

    const locationIdContainer = document.createElement('div');
    locationIdContainer.classList.add('mb-3');
    const locationIdLabel = document.createElement('label');
    locationIdLabel.setAttribute('for', 'location_id');
    locationIdLabel.classList.add('form-label');
    locationIdLabel.innerText = 'Location ID';
    const locationIdInput = document.createElement('input');
    locationIdInput.type = 'number';
    locationIdInput.min = 0;
    locationIdInput.classList.add('form-control');
    locationIdInput.id = 'location_id';
    locationIdInput.name = 'location_id';
    locationIdInput.value = department.location_id ?? '';
    locationIdContainer.append(locationIdLabel, locationIdInput);

    form.append(departmentNameContainer, managerContainer, locationIdContainer);

    modalContent.appendChild(form);

    const modalFooter = document.querySelector('#department-modal-footer');
    modalFooter.innerHTML = '';
    const okBtn = document.createElement('button');
    okBtn.classList.add('btn', 'btn-primary', 'col-md-5');
    okBtn.innerText = okLabel;
    okBtn.addEventListener('click', async () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        department = collectFormData(form, department);
        const res = await okFunc(department);
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
            $('#department-modal').modal('toggle');
        });
        renderDepartments(departmentsContainer, await getAllDepartments());
    });
    modalFooter.appendChild(okBtn);
    if (withCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.classList.add('btn', 'btn-secondary', 'col-md-5');
        cancelBtn.innerText = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            $(function () {
                $('#department-modal').modal('toggle');
            });
        });
        modalFooter.appendChild(cancelBtn);
    }
};

const collectFormData = (form, old) => {
    old.department_name = form.department_name.value;
    old.manager_id = parseInt(form.manager_id.value);
    old.location_id = form.location_id.value;
    return old;
};

export { renderDepartmentForm, renderDepartments };
