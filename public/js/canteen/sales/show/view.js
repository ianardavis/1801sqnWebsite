let statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Complete'}
function getSale() {
    get({
        table: 'sale',
        where: {sale_id: path[2]}
    })
    .then(function ([sale, options]) {
        set_breadcrumb(sale.sale_id);
        set_innerText('sale_createdAt', print_date(sale.createdAt, true));
        set_innerText('sale_user',      print_user(sale.user));
        set_innerText('sale_status',    statuses[sale.status] || 'Unknown');
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getSale);
});