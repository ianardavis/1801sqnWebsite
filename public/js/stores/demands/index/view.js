let demand_statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
function getDemands() {
    clear('tbl_demands')
    .then(tbl_demands => {
        let where = {},
            gt    = null,
            lt    = null,
            statuses  = getSelectedOptions('sel_demand_statuses'),
            supplier  = document.querySelector('#filter_demands_supplier'),
            date_from = document.querySelector('#filter_demands_createdAt_from'),
            date_to   = document.querySelector('#filter_demands_createdAt_to');
        if (statuses.length > 0) where.status = statuses;
        if (supplier  && supplier .value !== '') where.supplier_id = supplier.value;
        if (date_from && date_from.value !== '') gt = {column: 'createdAt', value: date_from.value};
        if (date_to   && date_to  .value !== '') lt = {column: 'createdAt', value: date_to  .value};
        get({
            table: 'demands',
            where: where,
            gt: gt,
            lt: lt,
            // ...build_filter_query('demands'),
            func: getDemands
        })
        .then(function ([result, options]) {
            result.demands.forEach(demand => {
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
            });
            return tbl_demands;
        });
    });
};
function getSuppliers() {
    listSuppliers({
        select: 'filter_demands_supplier',
        blank: true,
        blank_text: 'All',
        id_only: true
    })
    .then(result => getDemands())
    .catch(err =>   getDemands())
};
window.addEventListener('load', function () {
    addListener('reload', getDemands);
    getSuppliers();
    addListener('reload_suppliers', getSuppliers);
    addListener('filter_demands_supplier',       getDemands, 'input');
    addListener('status_demands_0',              getDemands, 'input');
    addListener('status_demands_1',              getDemands, 'input');
    addListener('status_demands_2',              getDemands, 'input');
    addListener('status_demands_3',              getDemands, 'input');
    addListener('filter_demands_createdAt_from', getDemands, 'input');
    addListener('filter_demands_createdAt_to',   getDemands, 'input');
    add_sort_listeners('demands', getDemands);
});