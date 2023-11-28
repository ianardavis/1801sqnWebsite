function getNSNs() {
    clear('tbl_nsns')
    .then(tbl_nsns => {
        function add_line(nsn) {
            try {
                let row = tbl_nsns.insertRow(-1);
                addCell(row, {text: printNSN(nsn)});
                addCell(row, {html: (nsn.size.nsn_id === nsn.nsn_id ? _check() : '')});
                addCell(row, {
                    append: new Modal_Button(
                        _search(),
                        'nsn_view',
                        [{field: 'nsn_id', value: nsn.nsn_id}]
                    ).e}
                );
            } catch (error) {console.error(error)};
        };
        get({
            table: 'nsns',
            where: {size_id: path[2]},
            func: getNSNs
        })
        .then(function ([result, options]) {
            setCount('nsn', result.count);
            result.nsns.forEach(nsn => add_line(nsn));
        });
    });
};
function viewNSN(event) {
    function display_details([nsn, options]) {
        setInnerText('nsn_group_id',   `${String(nsn.nsn_group.code)  .padStart(2, '0')} | ${nsn.nsn_group.group}`);
        setInnerText('nsn_class_id',   `${String(nsn.nsn_class.code)  .padStart(2, '0')} | ${nsn.nsn_class.class}`);
        setInnerText('nsn_country_id', `${String(nsn.nsn_country.code).padStart(2, '0')} | ${nsn.nsn_country.country}`);
        setInnerText('item_number',    nsn.item_number);
        setInnerText('nsn_id',         nsn.nsn_id);
        setInnerText('nsn_view',       printNSN(nsn));
        setInnerText('_default',       yesno((nsn.nsn_id === nsn.size.nsn_id)));
        return nsn;
    };
    function set_links(nsn) {
        setHREF('btn_nsn_link', `/nsns/${nsn.nsn_id}`);
        return nsn;
    };
    get({
        table: 'nsn',
        where: {nsn_id: event.relatedTarget.dataset.nsn_id},
        spinner: 'nsn_view'
    })
    .then(display_details)
    .then(set_links)
    .catch(err => console.error(err));
};
window.addEventListener('load', function() {
    addListener('reload', getNSNs);
    modalOnShow('nsn_view', viewNSN);
    addSortListeners('nsns', getNSNs);
    getNSNs();
});