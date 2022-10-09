function getCount(table, status, options) {
    get({
        action: 'count',
        table: table,
        where: {status: status},
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