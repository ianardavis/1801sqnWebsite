let demand_statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Complete', '3': 'Closed'}
function getDemands() {
    clear_table('demands')
    .then(tbl_demands => {
        let sel_status = document.querySelector('#sel_demand_status') || {value: ''};
        get({
            table: 'demands',
            query: [`supplier_id=${path[2]}`, sel_status.value]
        })
        .then(function ([demands, options]) {
            set_count({id: 'demand', count: demands.length || '0'});
            demands.forEach(demand => {
                try {
                    let row = tbl_demands.insertRow(-1);
                    add_cell(row, table_date(demand.createdAt));
                    add_cell(row, {text: demand_statuses[demand.status]});
                    add_cell(row, {append: new Link({
                        href: `/demands/${demand.demand_id}`,
                        small: true
                    }).e});
                } catch (err) {
                    console.log(err);
                };
            });
        });
    })
};
addReloadListener(getDemands);
window.addEventListener('load', function () {
    document.querySelector('#sel_demand_status').addEventListener('change', getDemands);
});