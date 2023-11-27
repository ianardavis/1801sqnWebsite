function getNSN() {
    function display_details([nsn, options]) {
        setBreadcrumb(print_nsn(nsn));
        setInnerText('nsn_group',   `${String(nsn.nsn_group.code).padStart(2, '0')} | ${nsn.nsn_group.group}`);
        setInnerText('nsn_class',   `${String(nsn.nsn_class.code).padStart(2, '0')} | ${nsn.nsn_class.class}`);
        setInnerText('nsn_country', `${String(nsn.nsn_country.code).padStart(2, '0')} | ${nsn.nsn_country.country}`);
        setInnerText('item_number', `${nsn.item_number}`);
        return nsn;
    };
    get({
        table: 'nsn',
        where: {nsn_id: path[2]}
    })
    .then(display_details)
};
window.addEventListener('load', getNSN);