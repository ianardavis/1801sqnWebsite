let statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Closed'};
showLines = (lines, options) => {
    let table_body = document.querySelector('#linesTable');
    if (lines) document.querySelector('#line_count').innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        try {
            let row = table_body.insertRow(-1);
            if (!line.size._demand_page || line.size._demand_page === '' || !line.size._demand_cell || line.size._demand_cell === '') {
                row.classList.add('bg-red');
            };
            add_cell(row, {text: line.line_id});
            add_cell(row, {text: line.size.item._description});
            add_cell(row, {text: line.size._size});
            add_cell(row, {text: line._qty});
            add_cell(row, {id: `cell_status_${line.line_id}`});
            add_cell(row, {id: `cell_action_${line.line_id}`});
            add_modal(line, row);
            if (line._status !== 3 && line._status !== 0 && options.permissions.line_delete) {
                let mdl_header = document.querySelector(`#mdl_${line.line_id}_header`);
                mdl_header.appendChild(
                    new DeleteButton({
                        path: `/stores/demand_lines/${line.line_id}`,
                        float: true,
                        options: {onComplete: getLines}
                    }).form
                );
            }; 
            let cell_status = document.querySelector(`#cell_status_${line.line_id}`),
                cell_action = document.querySelector(`#cell_action_${line.line_id}`),
                action_options = [{value: '', text: 'Select Action', selected: true}];
            cell_status.innerText = statuses[line._status] || 'Unknown';
            if (line._status === 0) { //If cancelled
                // 
            } else if (line._status === 1) { //If pending
                //       
            } else if (line._status === 2) { //If open
                if (options.permissions.line_edit && line.demand._status === 2) {
                    action_options.push({value: '0', text: 'Cancel'});
                    action_options.push({value: '3', text: 'Receive'});
                };
            };
            if (options.permissions.line_edit && line.demand._status === 2) {
                let div_actions = document.createElement('div'),
                    div_details = document.createElement('div'),
                    div_stocks  = document.createElement('div'),
                    div_serials = document.createElement('div');
                let _status = new Select({
                    name: `actions[line_id${line.line_id}][_status]`,
                    id: `sel_${line.line_id}`,
                    small: true,
                    options: action_options
                }).select;
                _status.addEventListener("change", function () {
                    ['details', 'serials', 'stocks'].forEach(e => {
                        let _div = document.querySelector(`#${e}_${line.line_id}`);
                        _div.innerHTML = '';
                    })
                    if (this.value === '3') {
                        if (line.size._serials) {
                            enterSerial(line.line_id);
                        } else {
                            getStock(line.size_id, line.line_id, 'stocks');
                        };
                    };
                });
                div_details.setAttribute('id', `details_${line.line_id}`);
                div_stocks.setAttribute('id', `stocks_${line.line_id}`);
                div_serials.setAttribute('id', `serials_${line.line_id}`);
                div_actions.appendChild(_status);
                div_actions.appendChild(div_details);
                div_actions.appendChild(div_stocks);
                div_actions.appendChild(div_serials);
                cell_action.appendChild(div_actions);
            };
        } catch (error) {
            console.log(`Error loading line ${line.line_id}: ${error}`)
        };
    });
};
enterSerial = line_id => {
    let _cell = document.querySelector(`#serials_${line_id}`);
    _cell.appendChild(
        new Input({
            name: `actions[line_id${line_id}][_serial]`,
            small: true,
            placeholder: 'Serial #',
            required: true,
            maxlength: '45'
        }).input
    );
    _cell.appendChild(
        new Input({
            name: `actions[line_id${line_id}][_location]`,
            small: true,
            placeholder: 'Location',
            required: true,
            maxlength: '20'
        }).input
    );
};
function add_modal (line, row) {
    let btn_show = document.createElement('button');
    btn_show.setAttribute('type', 'button');
    btn_show.setAttribute('data-toggle', 'modal');
    btn_show.setAttribute('data-target', `mdl_${line.line_id}`);
    btn_show.classList.add('btn', 'btn-sm', 'btn-primary');
    btn_show.innerHTML = '<i class="fas fa-search"></i>';
    btn_show.addEventListener('click', () => {$(`#mdl_${line.line_id}`).modal('show')});
    add_cell(row, {append: btn_show, id: `mdl_cell_${line.line_id}`});
    let mdl_cell = document.querySelector(`#mdl_cell_${line.line_id}`);
    mdl_cell.appendChild(new Modal({id: line.line_id}).modal);
    let mdl_title = document.querySelector(`#mdl_${line.line_id}_title`);
    mdl_title.innerText = `Demand Line ${line.line_id}`;
    let mdl_body = document.querySelector(`#mdl_${line.line_id}_body`);
    mdl_body.appendChild(new Input_Group({title: 'Item', text: line.size.item._description, link: `/stores/items/${line.size.item_id}`}).group);
    mdl_body.appendChild(new Input_Group({title: 'Size', text: line.size._size, link: `/stores/sizes/${line.size_id}`}).group);
    mdl_body.appendChild(new Input_Group({title: 'Qty', text: line._qty}).group);
    mdl_body.appendChild(new Input_Group({title: 'Added', text: `${new Date(line.createdAt).toDateString()} ${new Date(line.createdAt).toLocaleTimeString()}`}).group);
    mdl_body.appendChild(new Input_Group({title: 'Added By', text: `${line.user.rank._rank } ${line.user.full_name}`, link: `/stores/users/${line.user_id}`}).group);
    mdl_body.appendChild(new Input_Group({title: 'Status', text: statuses[line._status]}).group);
    mdl_body.appendChild(document.createElement('hr'));
    if (line.receipt_line)    mdl_body.appendChild(new Input_Group({title: 'Received',        text: new Date(line.receipt_line.createdAt).toDateString()}).group);
    if (line.receipt_line_id) mdl_body.appendChild(new Input_Group({title: 'Receipt Line ID', text: line.receipt_line_id,                                                       link: `/stores/receipt_lines/${line.receipt_line_id}`}).group);
    if (line.receipt_line)    mdl_body.appendChild(new Input_Group({title: 'Received By',     text: `${line.receipt_line.user.rank._rank} ${line.receipt_line.user.full_name}`, link: `/stores/users/${line.receipt_line.user_id}`}).group);
};