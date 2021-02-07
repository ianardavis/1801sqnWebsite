let demand_statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Complete', '3': 'Closed'}
function getDemands() {
    let sel_status = document.querySelector('#sel_demand_status') || {value: ''};
    get(
        {
            table: 'demands',
            query: [`supplier_id=${path[3]}`, sel_status.value]
        },
        function (demands, options) {
            clearElement('demandTable');
            set_count({id: 'demand', count: demands.length || '0'})
            let table_body = document.querySelector('#tbl_demands');
            if (table_body) {
                table_body.innerHTML = '';
                demands.forEach(demand => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(demand.createdAt));
                    add_cell(row, {text: demand.lines.length});
                    add_cell(row, {text: demand_statuses[demand._status]});
                    add_cell(row, {append: new Link({
                        href: `/stores/demands/${demand.demand_id}`,
                        small: true
                    }).e});
                });
            };
        }
    );
};
document.querySelector('#reload')           .addEventListener('click',  getDemands);
document.querySelector('#sel_demand_status').addEventListener('change', getDemands);