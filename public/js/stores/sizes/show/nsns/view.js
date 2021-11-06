function getNSNs() {
    clear('tbl_nsns')
    .then(tbl_nsns => {
        let sort_cols = tbl_nsns.parentNode.querySelector('.sort') || null;
        get({
            table: 'nsns',
            query: [`size_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([nsns, options]) {
            set_count({id: 'nsn', count: nsns.length || '0'});
            nsns.forEach(nsn => {
                try {
                    let row = tbl_nsns.insertRow(-1);
                    add_cell(row, {text: print_nsn(nsn)});
                    add_cell(row, {html: (nsn.size.nsn_id === nsn.nsn_id ? '<i class="fas fa-check"></i>' : '')});
                    add_cell(row, {
                        append: new Link({
                            data:  [{field: 'nsn_id', value: nsn.nsn_id}],
                            modal: 'nsn_view',
                            small: true
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
        query: [`nsn_id=${event.relatedTarget.dataset.nsn_id}`],
        spinner: 'nsn_view'
    })
    .then(function([nsn, options]) {
        set_innerText({id: 'nsn_group_id',   text: `${String(nsn.nsn_group.code).padStart(2, '0')} | ${nsn.nsn_group.group}`});
        set_innerText({id: 'nsn_class_id',   text: `${String(nsn.nsn_class.code).padStart(2, '0')} | ${nsn.nsn_class.class}`});
        set_innerText({id: 'nsn_country_id', text: `${String(nsn.nsn_country.code).padStart(2, '0')} | ${nsn.nsn_country.country}`});
        set_innerText({id: 'item_number',    text: nsn.item_number});
        set_innerText({id: 'nsn_id',         text: nsn.nsn_id});
        set_innerText({id: 'nsn_view',       text: print_nsn(nsn)});
        set_innerText({id: '_default',       text: yesno((nsn.nsn_id === nsn.size.nsn_id))});
        set_attribute({id: 'btn_nsn_link',   attribute: 'href', value: `/nsns/${nsn.nsn_id}`});
    });
};
addReloadListener(getNSNs);
window.addEventListener('load', function() {
    modalOnShow('nsn_view', viewNSN);
});