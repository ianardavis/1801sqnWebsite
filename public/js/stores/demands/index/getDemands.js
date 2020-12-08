function getDemands() {
    let sel_status = document.querySelector('#sel_status') || {value: ''},
        statuses = {"0": "Cancelled", "1": "Draft", "2": "Open", "3":"Complete"};
    get(
        function (demands, options) {
            clearElement('tbl_demands');
            let table_body = document.querySelector('#tbl_demands');
            demands.forEach(demand => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    sort: new Date(demand.createdAt).getTime(),
                    text: new Date(demand.createdAt).toDateString()
                });
                add_cell(row, {text: demand.supplier._name});
                add_cell(row, {text: demand.lines.length});
                add_cell(row, {text: statuses[demand._status]});
                add_cell(row, {append: new Link({href: `/stores/demands/${demand.demand_id}`, small: true}).e});
            });
        },
        {
            table: 'demands',
            query: [sel_status.value]
        }
    );
};
document.querySelector('#reload').addEventListener('click', () => getDemands);
document.querySelector('#sel_status').addEventListener('change', () => getDemands());