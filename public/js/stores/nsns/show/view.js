function getNSN() {
    get({
        table: 'nsn',
        query: [`"nsn_id":"${path[2]}"`]
    })
    .then(function ([nsn, options]) {
        set_breadcrumb(print_nsn(nsn));
        set_innerText('nsn_group',   `${String(nsn.nsn_group.code).padStart(2, '0')} | ${nsn.nsn_group.group}`);
        set_innerText('nsn_class',   `${String(nsn.nsn_class.code).padStart(2, '0')} | ${nsn.nsn_class.class}`);
        set_innerText('nsn_country', `${String(nsn.nsn_country.code).padStart(2, '0')} | ${nsn.nsn_country.country}`);
        set_innerText('item_number', `${nsn.item_number}`);
    });
};