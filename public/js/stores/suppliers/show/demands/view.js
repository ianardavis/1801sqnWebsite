let demand_statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Complete', '3': 'Closed'}
function getDemands() {
    clear('tbl_demands')
    .then(tbl_demands => {
        let where = {supplier_id: path[2]},
            statuses = getSelectedOptions('sel_demand_status');
        if (statuses.length > 0) where.status = statuses;
        get({
            table: 'demands',
            where: where,
            func: getDemands
        })
        .then(function ([result, options]) {
            set_count('demand', result.count);
            result.demands.forEach(demand => {
                try {
                    let row = tbl_demands.insertRow(-1);
                    add_cell(row, table_date(demand.createdAt));
                    add_cell(row, {text: demand_statuses[demand.status]});
                    add_cell(row, {append: new Link(`/demands/${demand.demand_id}`).e});
                } catch (err) {
                    console.log(err);
                };
            });
        });
    })
};
window.addEventListener('load', function () {
    addListener('reload', getDemands);
    addListener('sel_demand_status', getDemands, 'change');
    add_sort_listeners('demands', getDemands);
    getDemands();
});