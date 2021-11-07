function getNSNs(size_id, line_id, cell, nsn_id = null) {
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `nsns_${line_id}`});
    get({
        table: 'nsns',
        query: [`"size_id":"${size_id}"`]
    })
    .then(function ([nsns, options]) {
        let opts = [{value: '', text: '... Select NSN'}];
        nsns.forEach(e => opts.push({
            value:    e.nsn_id,
            text:     print_nsn(e),
            selected: (e.nsn_id === nsn_id),
            default:  (e.nsn_id === nsn_id)
        }));
        _cell.appendChild(
            new Select({
                attributes: [
                    {field: 'name',     value:  `actions[${line_id}][nsn_id]`},
                    {field: 'required', value: true}
                ],
                small:    true,
                options:  opts
            }).e
        );
        remove_spinner(`nsns_${line_id}`);
    });
};