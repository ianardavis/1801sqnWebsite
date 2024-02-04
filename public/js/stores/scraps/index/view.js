let scrap_statuses   = {"0": "Cancelled", "1": "Draft", "3":"Closed"};
function get_scraps() {
    Promise.all([
        clear('tbl_scraps'),
        filterStatus('scrap')
    ])
    .then(([tbl_scraps, filterStatuses]) => {
        function add_line(scrap) {
            let row = tbl_scraps.insertRow(-1);
            addCell(row, tableDate(scrap.createdAt));
            addCell(row, {text: scrap.supplier.name});
            addCell(row, {text: scrap.lines.length || '0'});
            addCell(row, {text: scrap_statuses[scrap.status]});
            addCell(row, {append: new Link(`/scraps/${scrap.scrap_id}`).e});
        };

        get({
            table: 'scraps',
            where: {
                ...filterStatuses,
                ...filterSupplier('scrap')
            },
            gt: filterDateFrom('scrap'),
            lt: filterDateTo('scrap'),
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
    setStatusFilterOptions('scrap', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Draft', selected: true},
        {value: '2', text: 'Closed'}
    ]);
    addListener('reload', get_scraps);
    getSuppliers();
    addListener('reload_users', getSuppliers);
    addListener('filter_scrap_statuses', get_scraps, 'change');
    addListener('filter_scrap_suppliers', get_scraps, 'change');
    addListener('createdAt_from',     get_scraps, 'change');
    addListener('createdAt_to',       get_scraps, 'change');
    addSortListeners('scraps', get_scraps);
    get_scraps();
});