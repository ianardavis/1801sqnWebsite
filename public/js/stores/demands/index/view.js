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
                add_cell(row, table_date(demand.createdAt));
                add_cell(row, {text: demand.supplier.name});
                let line_cell = add_cell(row, {id: `${demand.demand_id}_lines`});
                add_cell(row, {text: demand_statuses[demand.status]});
                add_cell(row, {append: new Link(`/demands/${demand.demand_id}`).e});
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
                ...filter_status('demands'),
                ...filter_supplier('demands')
            },
            gt: filter_date_from('demands'),
            lt: filter_date_to('demands'),
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
    set_status_filter_options('demands', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Draft', selected: true},
        {value: '2', text: 'Complete', selected: true},
        {value: '3', text: 'Closed'}
    ])
    add_listener('reload', get_demands);
    add_listener('reload_suppliers', get_suppliers);
    add_listener('filter_demands_supplier',       get_demands, 'input');
    add_listener('status_demands_0',              get_demands, 'input');
    add_listener('status_demands_1',              get_demands, 'input');
    add_listener('status_demands_2',              get_demands, 'input');
    add_listener('status_demands_3',              get_demands, 'input');
    add_listener('filter_demands_createdAt_from', get_demands, 'input');
    add_listener('filter_demands_createdAt_to',   get_demands, 'input');
    add_sort_listeners('demands', get_demands);
    get_suppliers();
});