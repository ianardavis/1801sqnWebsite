const demand_statuses = {
    '0': 'Cancelled',
    '1': 'Draft',
    '2': 'Complete',
    '3': 'Closed'
};
function getDemands() {
    Promise.all([
        clear('tbl_demands'),
        filterStatus('demand')
    ])
    .then(([tbl_demands, filterStatuses]) => {
        function add_line(demand) {
            try {
                let row = tbl_demands.insertRow(-1);
                addCell(row, tableDate(demand.createdAt));
                addCell(row, {text: demand_statuses[demand.status]});
                addCell(row, {append: new Link(`/demands/${demand.demand_id}`).e});
            } catch (err) {
                console.error(err);
            };
        };
        get({
            table: 'demands',
            where: {
                supplier_id: path[2],
                ...filterStatuses
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
    setStatusFilterOptions('demand', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Draft',    selected: true},
        {value: '2', text: 'Complete', selected: true},
        {value: '3', text: 'Closed',   selected: true}
    ]);
    addListener('reload', getDemands);
    addListener('sel_demand_status', getDemands, 'change');
    addSortListeners('demands', getDemands);
    getDemands();
});