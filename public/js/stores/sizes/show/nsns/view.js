function getNSNs() {
    clear('tbl_nsns')
    .then(tbl_nsns => {
        get({
            table: 'nsns',
            query: [`"size_id":"${path[2]}"`],
            ...sort_query(tbl_nsns)
        })
        .then(function ([nsns, options]) {
            set_count('nsn', nsns.length || '0');
            nsns.forEach(nsn => {
                try {
                    let row = tbl_nsns.insertRow(-1);
                    add_cell(row, {text: print_nsn(nsn)});
                    add_cell(row, {html: (nsn.size.nsn_id === nsn.nsn_id ? '<i class="fas fa-check"></i>' : '')});
                    add_cell(row, {
                        append: new Link({
                            data:  [{field: 'nsn_id', value: nsn.nsn_id}],
                            modal: 'nsn_view'
                        }).e}
                    );
                } catch (error) {console.log(error)};
            });
        });
    });
};
function viewNSN(event) {
    get({
        table: 'nsn',
        query: [`"nsn_id":"${event.relatedTarget.dataset.nsn_id}"`],
        spinner: 'nsn_view'
    })
    .then(function([nsn, options]) {
        set_innerText('nsn_group_id',   `${String(nsn.nsn_group.code).padStart(2, '0')} | ${nsn.nsn_group.group}`);
        set_innerText('nsn_class_id',   `${String(nsn.nsn_class.code).padStart(2, '0')} | ${nsn.nsn_class.class}`);
        set_innerText('nsn_country_id', `${String(nsn.nsn_country.code).padStart(2, '0')} | ${nsn.nsn_country.country}`);
        set_innerText('item_number',    nsn.item_number);
        set_innerText('nsn_id',         nsn.nsn_id);
        set_innerText('nsn_view',       print_nsn(nsn));
        set_innerText('_default',       yesno((nsn.nsn_id === nsn.size.nsn_id)));
        set_href('btn_nsn_link', `/nsns/${nsn.nsn_id}`);
    });
};
addReloadListener(getNSNs);
window.addEventListener('load', function() {
    modalOnShow('nsn_view', viewNSN);
});