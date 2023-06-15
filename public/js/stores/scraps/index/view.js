let scrap_statuses   = {"0": "Cancelled", "1": "Draft", "3":"Closed"};
function get_scraps() {
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

        get({
            table: 'scraps',
            where: {
                ...filter_status('scrap'),
                ...filter_supplier('scrap')
            },
            gt: filter_date_from('scrap'),
            lt: filter_date_to('scrap'),
            func:  get_scraps
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
    set_status_filter_options('scrap', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Draft', selected: true},
        {value: '2', text: 'Closed'}
    ]);
    add_listener('reload', get_scraps);
    getSuppliers();
    add_listener('reload_users', getSuppliers);
    add_listener('filter_scrap_statuses', get_scraps, 'change');
    add_listener('filter_scrap_suppliers', get_scraps, 'change');
    add_listener('createdAt_from',     get_scraps, 'change');
    add_listener('createdAt_to',       get_scraps, 'change');
    add_sort_listeners('scraps', get_scraps);
    get_scraps();
});