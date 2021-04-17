let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getDemand() {
    get(
        {
            table: 'demand',
            query: [`demand_id=${path[2]}`]
        },
        function (demand, options) {
            set_innerText({id: 'supplier',      text: demand.supplier._name});
            set_innerText({id: 'user',          text: print_user(demand.user)});
            set_attribute({id: 'supplier_link', attribute: 'href', value: `/suppliers/${demand.supplier_id}`});
            set_attribute({id: 'user_link',     attribute: 'href', value: `/users/${demand.user_id}`});
            set_innerText({id: 'createdAt',     text: print_date(demand.createdAt, true)});
            set_innerText({id: 'updatedAt',     text: print_date(demand.updatedAt, true)});
            set_innerText({id: '_status',       text: statuses[demand._status]});
            if (demand._filename) set_innerText({id: 'file', text: String(demand._filename)});
            set_breadcrumb({
                text: demand.demnd_id,
                href: `/demands/${demand.demand_id}`
            });
        }
    );
};
document.querySelector('#reload').addEventListener('click', getDemand);