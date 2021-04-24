function getDemands() {
    clear_table('demands')
    .then(tbl_demands => {
        let sel_status    = document.querySelector('#sel_status')    || {value: ''},
            sel_suppliers = document.querySelector('#sel_suppliers') || {value: ''},
            statuses      = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
        get({
            table: 'demands',
            query: [sel_status.value, sel_suppliers.value]
        })
        .then(function ([demands, options]) {
            demands.forEach(demand => {
                let row = tbl_demands.insertRow(-1);
                add_cell(row, table_date(demand.createdAt));
                add_cell(row, {text: demand.supplier.name});
                add_cell(row, {data: {field: 'id', value: demand.demand_id}});
                add_cell(row, {text: statuses[demand.status]});
                add_cell(row, {append: new Link({href: `/demands/${demand.demand_id}`, small: true}).e});
            });
            if (typeof countLines === 'function') countLines();
        });
    });
};
function getSuppliers() {
    listSuppliers({
        blank: true,
        blank_opt: {text: 'All'}
    })
    .then(result => getDemands());
};
addReloadListener(getDemands)
window.addEventListener('load', function () {
    addClickListener('reload_suppliers', getSuppliers);
    document.querySelector('#sel_status')   .addEventListener('change', getDemands);
    document.querySelector('#sel_suppliers').addEventListener('change', getDemands);
});