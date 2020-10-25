showLines = (lines, options) => {
    let table_body = document.querySelector('#linesTable');
    if (lines) document.querySelector('#line_count').innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        try {
            let row = table_body.insertRow(-1);
            add_cell(row, {text: line.line_id});
            add_cell(row, {text: line.size.item._description});
            add_cell(row, {text: line.size._size});
            add_cell(row, {text: line._qty});
            add_cell(row, {id: `cell_action_${line.line_id}`});
            add_modal(line, row);
            let cell_action = document.querySelector(`#cell_action_${line.line_id}`);
            if (line._status === 0) { //If cancelled
                cell_action.innerText = 'Cancelled';
            } else if (line._status === 1) { //If pending
                cell_action.innerText = 'Pending';
                if (options.permissions.delete && line.request._status === 1) {
                    let mdl_header = document.querySelector(`#mdl_${line.line_id}_header`);
                    mdl_header.appendChild(
                        new DeleteButton({
                            path: `/stores/request_lines/${line.line_id}`,
                            float: true,
                            options: {onComplete: getLines}
                        }).form
                    );
                };            
            } else if (line._status === 2) { //If open
                if (options.permissions.line_edit && line.request._status === 2) {
                    let div_actions = document.createElement('div'),
                        div_action  = document.createElement('div'),
                        div_details = document.createElement('div'),
                        _status = new Select({
                            name: `actions[line_id${line.line_id}][_status]`,
                            id:   `sel_${line.line_id}`,
                            small: true,
                            options: [
                                {value: '1', text: 'Open'},
                                {value: '2', text: 'Approved'},
                                {value: '3', text: 'Declined'}
                            ]
                        }).select;
                    _status.addEventListener("change", function () {
                        if (this.value === '2') showActions(line.size_id, line.line_id)
                        else {
                            document.querySelector(`#action_${line.line_id}`).innerHTML  = '';
                            document.querySelector(`#details_${line.line_id}`).innerHTML = '';
                        };
                    });
                    div_action.setAttribute('id', `action_${line.line_id}`);
                    div_details.setAttribute('id', `details_${line.line_id}`);
                    div_actions.appendChild(_status);
                    div_actions.appendChild(div_action);
                    div_actions.appendChild(div_details);
                    cell_action.appendChild(div_actions);
                } else cell_action.innerText = 'Open';
            } else if (line._status === 3) cell_action.innerText = `Approved - ${line._action}`;
            else if (line._status === 4) cell_action.innerText = 'Declined';
        } catch (error) {
            console.log(`Error loading line ${line.line_id}: ${error}`)
        };
    });
    hide_spinner('requests');
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
    let div_modals = document.querySelector(`#div_modals`);
    div_modals.appendChild(new Modal({id: line.line_id, static: true}).modal);
    let mdl_title = document.querySelector(`#mdl_${line.line_id}_title`);
    mdl_title.innerText = `Request Line ${line.line_id}`;
    let mdl_body = document.querySelector(`#mdl_${line.line_id}_body`)
    mdl_body.appendChild(new Input_Group({title: 'Item', text: line.size.item._description, link: `/stores/items/${line.size.item_id}`}).group);
    mdl_body.appendChild(new Input_Group({title: 'Size', text: line.size._size, link: `/stores/sizes/${line.size_id}`}).group);
    mdl_body.appendChild(new Input_Group({title: 'Qty', text: line._qty}).group);
    mdl_body.appendChild(new Input_Group({title: 'Added', text: `${new Date(line.createdAt).toDateString()} ${new Date(line.createdAt).toLocaleTimeString()}`}).group);
    mdl_body.appendChild(new Input_Group({title: 'Added By', text: `${line.user_add.rank._rank } ${line.user_add.full_name}`, link: `/stores/users/${line.user_id}`}).group);
    if (line._status === 1) {
        mdl_body.appendChild(new Input_Group({title: 'Status', text: 'Pending'}).group);
    } else if (line._status === 2) {
        mdl_body.appendChild(new Input_Group({title: 'Status', text: 'Open'}).group);
    } else if (line._status === 3) {
        mdl_body.appendChild(new Input_Group({title: 'Status', text: 'Approved'}).group);
        if (line._date) mdl_body.appendChild(new Input_Group({title: 'Approved', text: `${new Date(line._date).toDateString()} ${new Date(line._date).toLocaleTimeString()}`}).group)
        else mdl_body.appendChild(new Input_Group({title: 'Approved', text: ''}).group)
        if (line.user_approve) mdl_body.appendChild(new Input_Group({title: 'Approved By', text: `${line.user_approve.rank._rank } ${line.user_approve.full_name}`, link: `/stores/users/${line.approved_by}`}).group)
        else mdl_body.appendChild(new Input_Group({title: 'Approved By', text: ''}).group);
        mdl_body.appendChild(new Input_Group({title: 'Action', text: line._action}).group)
        mdl_body.appendChild(new Input_Group({title: `${line._action} ID`, text: line._id, link: `/stores/${line._action.toLowerCase()}_lines/${line._id}`}).group)
    } else if (line._status === 4) {
        mdl_body.appendChild(new Input_Group({title: 'Status', text: 'Declined'}).group)
        if (line._date) mdl_body.appendChild(new Input_Group({title: 'Declined', text: new Date(line._date).toDateString()}).group)
        else mdl_body.appendChild(new Input_Group({title: 'Declined', text: ''}).group)
        if (line.user_approve) mdl_body.appendChild(new Input_Group({title: 'Declined By', text: `${line.user_approve.rank._rank } ${line.user_approve.full_name}`}).group)
        else mdl_body.appendChild(new Input_Group({title: 'Declined By', text: ''}).group);
    } else mdl_body.appendChild(new Input_Group({title: 'Status', text: 'Unknown'}).group)
};
function showActions (size_id, line_id) {
    let _cell = document.querySelector(`#action_${line_id}`);
    _cell.innerHTML = '';
    add_spinner(_cell, {id: line_id});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let options = [{value: '', text: '... Select Action'}];
            if (response.sizes[0]._orderable) options.push({value: 'Order', text: 'Order'});
            if (response.sizes[0]._issueable) options.push({value: 'Issue', text: 'Issue'});
            let _action = new Select({
                small: true,
                name: `actions[line_id${line_id}][_action]`,
                required: true,
                options: options
            }).select;
            _action.addEventListener("change",  function () {
                if (this.value === 'Issue') {
                    getStock(size_id, line_id, 'details');
                    if (response.sizes[0]._nsns) getNSNs(size_id, line_id, 'details', response.sizes[0].nsn_id);
                    if (response.sizes[0]._serials) getSerials(size_id, line_id, 'details');
                } else document.querySelector(`#details_${line_id}`).innerHTML = '';
            });
            _cell.appendChild(_action);
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(line_id);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(line_id);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/sizes?size_id=${size_id}`);
    XHR.send();
};