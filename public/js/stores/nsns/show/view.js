function getNSN() {
    get({
        table: 'nsn',
        query: [`nsn_id=${path[2]}`]
    })
    .then(function ([nsn, options]) {
        set_breadcrumb({text: print_nsn(nsn)});
        set_innerText({id: 'nsn_group',   text: `${String(nsn.nsn_group.code).padStart(2, '0')} | ${nsn.nsn_group.group}`});
        set_innerText({id: 'nsn_class',   text: `${String(nsn.nsn_class.code).padStart(2, '0')} | ${nsn.nsn_class.class}`});
        set_innerText({id: 'nsn_country', text: `${String(nsn.nsn_country.code).padStart(2, '0')} | ${nsn.nsn_country.country}`});
        set_innerText({id: 'item_number', text: `${nsn.item_number}`});
    });
};