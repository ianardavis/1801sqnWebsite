let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getDemand() {
    get({
        table: 'demand',
        query: [`demand_id=${path[2]}`]
    })
    .then(function ([demand, options]) {
        set_innerText({id: 'demand_supplier',  text: demand.supplier.name});
        set_innerText({id: 'demand_user',      text: print_user(demand.user)});
        set_innerText({id: 'demand_createdAt', text: print_date(demand.createdAt, true)});
        set_innerText({id: 'demand_updatedAt', text: print_date(demand.updatedAt, true)});
        set_innerText({id: 'demand_status',    text: statuses[demand.status]});
        set_innerText({id: 'demand_file',      text: (demand.filename ? String(demand.filename) : '')});
        set_breadcrumb({text: demand.demand_id});
        set_href({id: 'demand_supplier_link', value: `/suppliers/${demand.supplier_id}`});
        set_href({id: 'demand_user_link',     value: `/users/${demand.user_id}`});
    })
    .catch(err => window.location.replace('/demands'));
};
addReloadListener(getDemand);