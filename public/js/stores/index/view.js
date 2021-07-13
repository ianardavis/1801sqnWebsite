function getCount(table, query, options) {
    count({
        table: table,
        query: query,
        ...options
    })
    .then(function ([count, options]) {
        if (count == 0) options.colour = 'success';
        let header = document.querySelector(`#crd_${table} .card-header`);
        header.appendChild(new Badge({
            ...options,
            count: count
        }).e);
    });
};