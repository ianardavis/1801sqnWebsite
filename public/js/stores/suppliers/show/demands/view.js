const demand_statuses = {
    '0': 'Cancelled',
    '1': 'Draft',
    '2': 'Complete',
    '3': 'Closed'
};
function getDemands() {
    clear('tbl_demands')
    .then(tbl_demands => {
        function add_line(demand) {
            try {
                let row = tbl_demands.insertRow(-1);
                add_cell(row, table_date(demand.createdAt));
                add_cell(row, {text: demand_statuses[demand.status]});
                add_cell(row, {append: new Link(`/demands/${demand.demand_id}`).e});
            } catch (err) {
                console.error(err);
            };
        };
        get({
            table: 'demands',
            where: {
                supplier_id: path[2],
                ...filter_status('demand')
            },
            func: getDemands
        })
        .then(function ([result, options]) {
            setCount('demand', result.count);
            result.demands.forEach(demand => add_line(demand));
        });
    })
};
window.addEventListener('load', function () {
    set_status_filter_options('demand', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Draft',    selected: true},
        {value: '2', text: 'Complete', selected: true},
        {value: '3', text: 'Closed',   selected: true}
    ]);
    add_listener('reload', getDemands);
    add_listener('sel_demand_status', getDemands, 'change');
    add_sort_listeners('demands', getDemands);
    getDemands();
});