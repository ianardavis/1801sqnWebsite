let statuses = {'0': 'Cancelled', '1': 'Open', '2': 'Complete'}
function getSale() {
    get({
        table: 'sale',
        where: {sale_id: path[2]}
    })
    .then(function ([sale, options]) {
        setBreadcrumb(sale.sale_id);
        setInnerText('sale_createdAt', printDate(sale.createdAt, true));
        setInnerText('sale_user',      printUser(sale.user));
        setInnerText('sale_status',    statuses[sale.status] || 'Unknown');
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSale);
});