function getDemands() {
    clear_table('demands')
    .then(tbl_demands => {
        let sel_suppliers   = document.querySelector('#sel_suppliers') || {value: ''},
            demand_statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"},
            statuses        = document.querySelectorAll("input[type='checkbox']:checked") || [],
            query = [];
        statuses.forEach(e => query.push(e.value));;
        get({
            table: 'demands',
            query: [query.join('&'), sel_suppliers.value]
        })
        .then(function ([demands, options]) {
            demands.forEach(demand => {
                let row = tbl_demands.insertRow(-1);
                add_cell(row, table_date(demand.createdAt));
                add_cell(row, {text: demand.supplier.name});
                add_cell(row, {classes: ['demand'], data: [{field: 'id', value: demand.demand_id}]});
                add_cell(row, {text: demand_statuses[demand.status]});
                add_cell(row, {append: new Link({href: `/demands/${demand.demand_id}`, small: true}).e});
            });
            return true;
        })
        .then(result => {
            document.querySelectorAll('.demand').forEach(e => {
                count({
                    table: 'demand_lines',
                    query: [`demand_id=${e.dataset.id}`]
                })
                .then(function ([count, options]) {
                    e.innerText = count || '0';
                    e.removeAttribute('data-id');
                    e.classList.remove('demand');
                });
            });
        });
    });
};
function getSuppliers() {
    listSuppliers({
        blank: true,
        blank_text: 'All'
    })
    .then(result => getDemands())
    .catch(err =>   getDemands());
};
addReloadListener(getDemands)
window.addEventListener('load', function () {
    addListener('reload_suppliers', getSuppliers);
    addListener('sel_suppliers',    getDemands, 'change');
    addListener('status_0',         getDemands, 'change');
    addListener('status_1',         getDemands, 'change');
    addListener('status_2',         getDemands, 'change');
    addListener('status_3',         getDemands, 'change');
});