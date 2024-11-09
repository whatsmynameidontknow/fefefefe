export const initDataTable = (tableSelector, opts = {}) => {
    return new DataTable(tableSelector, {
        pageLength: 5,
        lengthMenu: [5, 10, 15],
        language: {
            emptyTable: 'No data available',
        },
        ...opts,
    });
};
