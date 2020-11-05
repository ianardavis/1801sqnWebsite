let statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Closed'};
showLines = (lines, options) => {
    let table_body = document.querySelector('#tbl_lines');
    if (lines) document.querySelector('#line_count').innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        try {
            let row = table_body.insertRow(-1);
            add_cell(row, {text: line.line_id});
            add_cell(row, {text: line.size.item._description});
            add_cell(row, {text: line.size._size});
            add_cell(row, {text: line._qty});
            add_cell(row, {text: line.stock.location._location});
            add_cell(row, {id: `cell_action_${line.line_id}`});
            add_modal(line, row);
            if (line._status !== 5 && line._status !== 0 && options.permissions.line_delete) {
                let mdl_header = document.querySelector(`#mdl_${line.line_id}_header`);
                mdl_header.appendChild(
                    new DeleteButton({
                        path: `/stores/receipt_lines/${line.line_id}`,
                        float: true,
                        options: {onComplete: getLines}
                    }).e
                );
            }; 
            let cell_action = document.querySelector(`#cell_action_${line.line_id}`),
                action_options = [{value: '', text: 'Select Action', selected: true}];
            if (line._status === 0) { //If cancelled
                // 
            } else if (line._status === 1) { //If pending
                if (options.permissions.line_edit && line.receipt._status === 1) {
                    action_options.push({value: '0', text: 'Cancel'});
                }; 
            };
            if (options.permissions.line_edit && line.receipt._status === 2) {
                let div_actions = document.createElement('div');
                let _status = new Select({
                    name: `actions[line_id${line.line_id}][_status]`,
                    id: `sel_${line.line_id}`,
                    small: true,
                    options: action_options
                }).e;
                div_actions.appendChild(_status);
                cell_action.appendChild(div_actions);
            };
        } catch (error) {
            console.log(error)
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
        }).e
    );
    _cell.appendChild(
        new Input({
            name: `actions[line_id${line_id}][_location]`,
            small: true,
            placeholder: 'Location',
            required: true,
            maxlength: '20'
        }).e
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
    mdl_cell.appendChild(new Modal({id: line.line_id}).e);
    let mdl_title = document.querySelector(`#mdl_${line.line_id}_title`);
    mdl_title.innerText = `Receipt Line ${line.line_id}`;
    let mdl_body = document.querySelector(`#mdl_${line.line_id}_body`);
    mdl_body.appendChild(new Input_Group({title: 'Item',     text: line.size.item._description, link: `/stores/items/${line.size.item_id}`}).e);
    mdl_body.appendChild(new Input_Group({title: 'Size',     text: line.size._size, link: `/stores/sizes/${line.size_id}`}).e);
    mdl_body.appendChild(new Input_Group({title: 'Qty',      text: line._qty}).e);
    mdl_body.appendChild(new Input_Group({title: 'Added',    text: print_date(line.createdAt, true)}).e);
    mdl_body.appendChild(new Input_Group({title: 'Added By', text: user_name(line.user), link: `/stores/users/${line.user_id}`}).e);
    mdl_body.appendChild(new Input_Group({title: 'Status',   text: statuses[line._status]}).e);
    mdl_body.appendChild(document.createElement('hr'));
    ['Demand', 'Receipt', 'Issue'].forEach(e => {
        if (line[`${e.toLowerCase()}_date`])    mdl_body.appendChild(new Input_Group({title: `${e}ed`,       text: new Date(line[`${e.toLowerCase()}_date`]).toDateString()}).e);
        if (line[`${e.toLowerCase()}_line_id`]) mdl_body.appendChild(new Input_Group({title: `${e} Line ID`, text: line[`${e.toLowerCase()}_line_id`], link: `/stores/demand_lines/${line[`${e.toLowerCase()}_line_id`]}`}).e);
        if (line[`user_${e.toLowerCase()}`])    mdl_body.appendChild(new Input_Group({title: `${e}ed By`,    text: `${line[`user_${e.toLowerCase()}`].rank._rank} ${line[`user_${e.toLowerCase()}`].full_name}`, link: `/stores/users/${line[`${e.toLowerCase()}_user_id`]}`}).e);
        mdl_body.appendChild(document.createElement('hr'));   
    });
};