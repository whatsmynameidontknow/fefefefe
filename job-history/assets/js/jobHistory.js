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

export { renderJobHistory };
