let demand_statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
function get_demands() {
    function demand_query() {
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
        return {
            where: where,
            gt:    gt,
            lt:    lt
        };
    };
    clear('tbl_demands')
    .then(tbl_demands => {
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
        get({
            table: 'demands',
            ...demand_query(),
            func: get_demands
        })
        .then(function ([result, options]) {
            result.demands.forEach(demand => {
                add_line(demand);
            });
            return tbl_demands;
        });
    });
};
function get_suppliers() {
    listSuppliers({
        select: 'filter_demands_supplier',
        blank: true,
        blank_text: 'All',
        id_only: true
    })
    .finally(() => get_demands());
};
window.addEventListener('load', function () {
    add_listener('reload', get_demands);
    get_suppliers();
    add_listener('reload_suppliers', get_suppliers);
    add_listener('filter_demands_supplier',       get_demands, 'input');
    add_listener('status_demands_0',              get_demands, 'input');
    add_listener('status_demands_1',              get_demands, 'input');
    add_listener('status_demands_2',              get_demands, 'input');
    add_listener('status_demands_3',              get_demands, 'input');
    add_listener('filter_demands_createdAt_from', get_demands, 'input');
    add_listener('filter_demands_createdAt_to',   get_demands, 'input');
    add_sort_listeners('demands', get_demands);
});