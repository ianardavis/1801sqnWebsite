let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getDemand() {
    get({
        table: 'demand',
        where: {demand_id: path[2]}
    })
    .then(function ([demand, options]) {
        set_breadcrumb(`${demand.supplier.name} - ${print_date(demand.createdAt)}`);
        set_innerText('demand_supplier',  demand.supplier.name);
        set_innerText('demand_user',      print_user(demand.user));
        set_innerText('demand_createdAt', print_date(demand.createdAt, true));
        set_innerText('demand_updatedAt', print_date(demand.updatedAt, true));
        set_innerText('demand_status',    statuses[demand.status]);
        set_innerText('demand_file',      (demand.filename ? demand.filename : ''));
        if (demand.status > 1 || demand.filename) {
            set_attribute('form_download', 'action', `/demands/${path[2]}/download`);
            enable_button('download');
        } else {
            set_attribute('form_download', 'action');
            disable_button('download');
        };
        set_href('demand_supplier_link', `/suppliers/${demand.supplier_id}`);
        set_href('demand_user_link',     `/users/${demand.user_id}`);
        document.querySelectorAll('.demand_id').forEach(e => e.setAttribute('value', demand.demand_id))
    })
    .catch(err => window.location.assign('/demands'));
};
window.addEventListener('load', function () {
    addListener('reload', getDemand);
});