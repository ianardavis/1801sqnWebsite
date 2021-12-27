let demand_statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
function query() {
    let where = null,
        like  = null,
        gt    = null,
        lt    = null;
    
    let sel_statuses = checked_statuses();
    if (sel_statuses) where = {status: sel_statuses};

    let date_from = document.querySelector(`#filter_demands_createdAt_from`) || {value: ''},
        date_to   = document.querySelector(`#filter_demands_createdAt_to`)   || {value: ''};
    if (date_from && date_from.value !== '') gt = {column: 'createdAt', value: date_from.value};
    if (date_to   && date_to.value   !== '') lt = {column: 'createdAt', value: date_to  .value};

    let item  = document.querySelector('#filter_demands_item')   || {value: ''},
        size1 = document.querySelector('#filter_demands_size_1') || {value: ''},
        size2 = document.querySelector('#filter_demands_size_2') || {value: ''},
        size3 = document.querySelector('#filter_demands_size_3') || {value: ''};
    if (item.value || size1.value || size2.value || size3.value) like = {};
    if (item .value !=='') like.description = item.value;
    if (size1.value !=='') like.size1       = size1.value;
    if (size2.value !=='') like.size2       = size2.value;
    if (size3.value !=='') like.size3       = size3.value;

    return {
        where: where,
        like:  like,
        gt:    gt,
        lt:    lt
    };
};
function getDemands() {
    clear('tbl_demands')
    .then(tbl_demands => {
        get({
            table: 'demands',
            ...query(),
            func: getDemands
        })
        .then(function ([result, options]) {
            result.demands.forEach(demand => {
                let row = tbl_demands.insertRow(-1);
                add_cell(row, table_date(demand.createdAt));
                add_cell(row, {text: demand.supplier.name});
                let line_cell = add_cell(row, {id: `${demand.demand_id}_lines`});
                add_cell(row, {text: demand_statuses[demand.status]});
                add_cell(row, {append: new Link({href: `/demands/${demand.demand_id}`}).e});
                count({
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
        blank: true,
        blank_text: 'All'
    })
    .then(result => getDemands())
    .catch(err =>   getDemands())
};
addReloadListener(getDemands);
sort_listeners(
    'demands',
    getDemands,
    [
        {value: 'createdAt',   text: 'Date', selected: true},
        {value: 'supplier_id', text: 'Supplier'},
        {value: 'status',      text: 'Status'}
    ],
    false
);
window.addEventListener('load', function () {
    addListener('reload_suppliers', getSuppliers);
    addListener('sel_suppliers',    getDemands, 'change');
    addListener('status_0',         getDemands, 'change');
    addListener('status_1',         getDemands, 'change');
    addListener('status_2',         getDemands, 'change');
    addListener('status_3',         getDemands, 'change');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
});