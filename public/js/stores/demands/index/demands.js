showDemands = (demands, options = {}) => {
    let table_body = document.querySelector('#tbl_demands');
    table_body.innerHTML = '';
    demands.forEach(demand => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(demand.createdAt).getTime(),
            text: new Date(demand.createdAt).toDateString()
        });
        add_cell(row, {text: demand.supplier._name});
        add_cell(row, {text: demand.lines.length});
        if (demand._status === 0) add_cell(row, {text: 'Cancelled'})
        else if (demand._status === 1) add_cell(row, {text: 'Draft'})
        else if (demand._status === 2) add_cell(row, {text: 'Open'})
        else if (demand._status === 3) add_cell(row, {text: 'Complete'});
        add_cell(row, {append: new Link({href: `/stores/demands/${demand.demand_id}`, small: true}).e});
    });
};