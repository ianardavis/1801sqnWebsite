const demand_statuses = {
    "0": "Cancelled",
    "1": "Draft",
    "2": "Complete",
    "3": "Closed"
};

function get_demands() {
    clear('tbl_demands')
    .then(tbl_demands => {
        function add_lines([result, options]) {
            function add_line(demand) {
                let row = tbl_demands.insertRow(-1);
                addCell(row, tableDate(demand.createdAt));
                addCell(row, {text: demand.supplier.name});
                let line_cell = addCell(row, {id: `${demand.demand_id}_lines`});
                addCell(row, {text: demand_statuses[demand.status]});
                addCell(row, {append: new Link(`/demands/${demand.demand_id}`).e});
                get({
                    action: 'count',
                    table: 'demand_lines',
                    where: {
                        demand_id: demand.demand_id,
                        status: [1, 2]
                    }
                })
                .then(function ([count, options]) {
                    line_cell.innerText = count || '0';
                });
            };
            result.demands.forEach(demand => {
                add_line(demand);
            });
            return result;
        };
        get({
            table: 'demands',
            where: {
                ...filterStatus('demands'),
                ...filterSupplier('demands')
            },
            gt: filterDateFrom('demands'),
            lt: filterDateTo('demands'),
            func: get_demands
        })
        .then(add_lines);
    });
};
function get_suppliers() {
    listSuppliers({
        select: 'filter_demands_supplier',
        blank: true,
        blank_text: 'All',
        id_only: true
    })
    .finally(get_demands);
};
window.addEventListener('load', function () {
    setStatusFilterOptions('demands', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Draft', selected: true},
        {value: '2', text: 'Complete', selected: true},
        {value: '3', text: 'Closed'}
    ]);
    addListener('reload', get_demands);
    addListener('reload_suppliers', get_suppliers);
    addListener('filter_demands_supplier',       get_demands, 'input');
    addListener('status_demands_0',              get_demands, 'input');
    addListener('status_demands_1',              get_demands, 'input');
    addListener('status_demands_2',              get_demands, 'input');
    addListener('status_demands_3',              get_demands, 'input');
    addListener('filter_demands_createdAt_from', get_demands, 'input');
    addListener('filter_demands_createdAt_to',   get_demands, 'input');
    addSortListeners('demands', get_demands);
    get_suppliers();
});