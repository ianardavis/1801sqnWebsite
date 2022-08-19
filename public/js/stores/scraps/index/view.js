let scrap_statuses   = {"0": "Cancelled", "1": "Draft", "3":"Closed"};
function getScraps() {
    clear('tbl_scraps')
    .then(tbl_scraps => {
        let sel_suppliers = document.querySelector('#filter_scrap_suppliers') || {value: ''},
            where     = {},
            statuses  = getSelectedOptions('sel_scrap_statuses');
        if (statuses.length > 0) where.status = statuses;
        if (sel_suppliers && sel_suppliers.value !== "") where.supplier_id = sel_suppliers.value;
        get({
            table: 'scraps',
            ...build_filter_query('scrap'),
            // where: where,
            func:  getScraps
        })
        .then(function ([results, options]) {
            results.scraps.forEach(scrap => {
                let row = tbl_scraps.insertRow(-1);
                add_cell(row, table_date(scrap.createdAt));
                add_cell(row, {text: scrap.supplier.name});
                add_cell(row, {text: scrap.lines.length || '0'});
                add_cell(row, {text: scrap_statuses[scrap.status]});
                add_cell(row, {append: new Link({href: `/scraps/${scrap.scrap_id}`}).e});
            });
        });
    });
};
function getSuppliers() {
    listSuppliers({
        select: 'filter_scrap_suppliers',
        blank: {text: 'All'}
    })  
};
sort_listeners(
    'scraps',
    getScraps,
    [
        {value: '["createdAt"]',   text: 'Created', selected: true},
        {value: '["supplier_id"]', text: 'Supplier'},
        {value: '["status"]',      text: 'Status'}
    ]
);
addReloadListener(getScraps);
window.addEventListener('load', function () {
    getSuppliers();
    addListener('reload_users', getSuppliers);
    addListener('filter_scrap_statuses', getScraps, 'change');
    addListener('filter_scrap_suppliers', getScraps, 'change');
    addListener('createdAt_from',     getScraps, 'change');
    addListener('createdAt_to',       getScraps, 'change');
});