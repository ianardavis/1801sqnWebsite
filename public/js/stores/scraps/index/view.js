let scrap_statuses   = {"0": "Cancelled", "1": "Draft", "3":"Closed"};
function getScraps() {
    clear('tbl_scraps')
    .then(tbl_scraps => {
        function add_line(scrap) {
            let row = tbl_scraps.insertRow(-1);
            add_cell(row, table_date(scrap.createdAt));
            add_cell(row, {text: scrap.supplier.name});
            add_cell(row, {text: scrap.lines.length || '0'});
            add_cell(row, {text: scrap_statuses[scrap.status]});
            add_cell(row, {append: new Link(`/scraps/${scrap.scrap_id}`).e});
        };

        const sel_suppliers = document.querySelector('#filter_scrap_suppliers') || {value: ''};
        let where     = {};
        const statuses  = getSelectedOptions('sel_scrap_statuses');
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
                add_line(scrap);
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
window.addEventListener('load', function () {
    add_listener('reload', getScraps);
    getSuppliers();
    add_listener('reload_users', getSuppliers);
    add_listener('filter_scrap_statuses', getScraps, 'change');
    add_listener('filter_scrap_suppliers', getScraps, 'change');
    add_listener('createdAt_from',     getScraps, 'change');
    add_listener('createdAt_to',       getScraps, 'change');
    add_sort_listeners('scraps', getScraps);
    getScraps();
});