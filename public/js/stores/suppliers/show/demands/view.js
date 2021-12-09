let demand_statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Complete', '3': 'Closed'}
function getDemands() {
    clear('tbl_demands')
    .then(tbl_demands => {
        let sel_status = document.querySelector('#sel_demand_status') || {value: ''},
            sort_cols  = tbl_demands.parentNode.querySelector('.sort') || null,
            query      = [`"supplier_id":"${path[2]}"`];
        if (sel_status.value !== '') query.push(sel_status.value)
        get({
            table: 'demands',
            query: query,
            ...sort_query(sort_cols)
        })
        .then(function ([demands, options]) {
            set_count('demand', demands.length || '0');
            demands.forEach(demand => {
                try {
                    let row = tbl_demands.insertRow(-1);
                    add_cell(row, table_date(demand.createdAt));
                    add_cell(row, {text: demand_statuses[demand.status]});
                    add_cell(row, {append: new Link({href: `/demands/${demand.demand_id}`}).e});
                } catch (err) {
                    console.log(err);
                };
            });
        });
    })
};
addReloadListener(getDemands);
window.addEventListener('load', function () {
    addListener('sel_demand_status', getDemands, 'change');
});