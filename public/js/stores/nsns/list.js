function getNSNs(size_id, line_id, cell, nsn_id = null) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    _cell.appendChild(new Spinner(`nsns_${line_id}`).e);
    get({
        table: 'nsns',
        where: {size_id: size_id}
    })
    .then(function ([nsns, options]) {
        let opts = [{value: '', text: '... Select NSN'}];
        nsns.forEach(e => opts.push({
            value:    e.nsn_id,
            text:     printNSN(e),
            selected: (e.nsn_id === nsn_id),
            default:  (e.nsn_id === nsn_id)
        }));
        _cell.appendChild(
            new Select({
                attributes: [
                    {field: 'name',     value:  `actions[${line_id}][nsn_id]`},
                    {field: 'required', value: true}
                ],
                options:  opts
            }).e
        );
        removeSpinner(`nsns_${line_id}`);
    });
};