let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getDemand() {
    get(
        function (demand, options) {
            set_innerText({id: `supplier`,      text: demand.supplier._name});
            set_innerText({id: 'user',          text: print_user(demand.user)});
            set_attribute({id: `supplier_link`, attribute: 'href', value: `/stores/suppliers/${demand.supplier_id}`});
            set_attribute({id: 'user_link',     attribute: 'href', value: `/stores/users/${demand.user_id}`});
            set_innerText({id: 'createdAt',     text: print_date(demand.createdAt, true)});
            set_innerText({id: 'updatedAt',     text: print_date(demand.updatedAt, true)});
            set_innerText({id: '_status',       text: statuses[demand._status]});
            if (demand._filename) set_innerText({id: 'file', text: String(demand._filename)});
            set_breadcrumb({
                text: demand[`demand_id`],
                href: `/stores/demands/${demand[`demand_id`]}`
            });
        },
        {
            table: 'demand',
            query: [`demand_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getDemand);