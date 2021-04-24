function setLineButtons(table) {
    get({
        table: table,
        query: [`${table}_id=${path[2]}`]
    })
    .then(function([result, options]) {
        ['action', 'sizeSelect'].forEach(e => disable_button(e));
        if      (result.status === 1) enable_button('sizeSelect');
        else if (result.status === 2) enable_button('action');
    });
};