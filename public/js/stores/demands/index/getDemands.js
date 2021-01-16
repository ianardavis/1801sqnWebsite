function getDemands() {
    let sel_status    = document.querySelector('#sel_status')    || {value: ''},
        sel_suppliers = document.querySelector('#sel_suppliers') || {value: ''},
        statuses      = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"},
        table_body    = document.querySelector('#tbl_demands');
    if (table_body) {
        table_body.innerHTML = '';
        get(
            function (demands, options) {
                demands.forEach(demand => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: new Date(demand.createdAt).getTime(),
                        text: print_date(demand.createdAt)
                    });
                    add_cell(row, {text: demand.supplier._name});
                    add_cell(row, {text: demand.lines.length});
                    add_cell(row, {text: statuses[demand._status]});
                    add_cell(row, {append: new Link({href: `/stores/demands/${demand.demand_id}`, small: true}).e});
                });
            },
            {
                table: 'demands',
                query: [sel_status.value, sel_suppliers.value]
            }
        );
    };
};
function loadGetDemands() {
    let get_interval = window.setInterval(
        function () {
            if (suppliers_loaded === true) {
                getDemands();
                clearInterval(get_interval);
            }
        },
        200
    );
};
document.querySelector('#reload')       .addEventListener('click',  loadGetDemands);
document.querySelector('#sel_status')   .addEventListener('change', loadGetDemands);
document.querySelector('#sel_suppliers').addEventListener('change', loadGetDemands);