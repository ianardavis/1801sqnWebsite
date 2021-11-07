let statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Complete'}
function getSale() {
    get({
        table: 'sale',
        query: [`"sale_id":"${path[2]}"`]
    })
    .then(function ([sale, options]) {
        set_innerText({id: 'sale_createdAt', value: print_date(sale.createdAt, true)});
        set_innerText({id: 'sale_user',      value: print_user(sale.user)});
        set_innerText({id: 'sale_status',    value: statuses[sale.status] || 'Unknown'});
        set_breadcrumb({text: sale.sale_id});
    });
};
addReloadListener(getSale);