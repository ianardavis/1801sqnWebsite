function setButtons() {
    get({
        table: 'loancard',
        query: [`loancard_id=${path[2]}`]
    })
    .then(function([result, options]) {
        ['complete', 'delete'].forEach(e => disable_button(e));
        if      (result.status === 1) ['complete', 'delete'].forEach(e => enable_button(e));
        else if (result.status === 2) enable_button('action');
    });
};