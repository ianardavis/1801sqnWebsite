var statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3':'Approved', '4':'Declined'};
function showLines (lines, options) {
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
                        }).e
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
                        }).e;
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
            console.log(`Error loading line ${line.line_id}:`)
            console.log(error);
        };
    });
    hide_spinner('requests');
};
function add_modal (line, row) {
    let nav        = document.createElement('nav'),
        nav_tabs   = document.createElement('div'),
        nav_bodies = document.createElement('div'),
        nav_body_1 = new Tab_Pane({id:{tab:`mdl_line_${line.line_id}_tab_1`,body:`mdl_line_${line.line_id}_body_1`},active:true}).e,
        nav_body_2 = new Tab_Pane({id:{tab:`mdl_line_${line.line_id}_tab_2`,body:`mdl_line_${line.line_id}_body_2`}}).e,
        nav_body_3 = new Tab_Pane({id:{tab:`mdl_line_${line.line_id}_tab_3`,body:`mdl_line_${line.line_id}_body_3`}}).e;
    nav_tabs.classList.add('nav', 'nav-tabs');
    nav_tabs.setAttribute('id', `mdl_line_${line.line_id}_tabs`);
    nav_tabs.setAttribute('role', 'tablist');
    nav_tabs.appendChild(new Tab({id:{tab:`mdl_line_${line.line_id}_tab_1`,body: `mdl_line_${line.line_id}_body_1`},text: 'Item',active: true}).e);
    nav_tabs.appendChild(new Tab({id:{tab:`mdl_line_${line.line_id}_tab_2`,body: `mdl_line_${line.line_id}_body_2`},text: 'Dates'}).e);
    nav_tabs.appendChild(new Tab({id:{tab:`mdl_line_${line.line_id}_tab_3`,body: `mdl_line_${line.line_id}_body_3`},text: 'Notes'}).e);
    nav.appendChild(nav_tabs);
    nav_bodies.classList.add('tab-content');
    nav_bodies.setAttribute('id',`mdl_line_${line.line_id}_bodies`);
    let div_modals = document.querySelector(`#div_modals`);
    add_cell(row, {append: new Modal_Link({id: `${line.line_id}`}).e, id: `mdl_cell_${line.line_id}`});
    div_modals.appendChild(new Modal({id: line.line_id, static: true}).e);
    let mdl_title = document.querySelector(`#mdl_${line.line_id}_title`),
        mdl_body  = document.querySelector(`#mdl_${line.line_id}_body`);
    mdl_title.innerText = `Request Line ${line.line_id}`;
    nav_body_1.appendChild(new Input_Group({title: 'Item',     text: line.size.item._description, link: `/stores/items/${line.size.item_id}`}).e);
    nav_body_1.appendChild(new Input_Group({title: 'Size',     text: line.size._size, link: `/stores/sizes/${line.size_id}`}).e);
    nav_body_1.appendChild(new Input_Group({title: 'Qty',      text: line._qty}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Status',   text: statuses[String(line._status)] || 'Unknown'}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Added',    text: print_date(line.createdAt, true)}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Added By', text: user_name(line.user_add), link: `/stores/users/${line.user_id}`}).e);
    if (line._status === 1) {
        //
    } else if (line._status === 2) {
        //
    } else if (line._status === 3) {
        nav_body_2.appendChild(new Input_Group({title: 'Approved',    text: print_date(line._date)}).e);
        nav_body_2.appendChild(new Input_Group({title: 'Approved By', text: user_name(line.user_approve), link: `/stores/users/${line.approved_by}`}).e);
        nav_body_2.appendChild(new Input_Group({title: 'Action',      text: line._action}).e)
        nav_body_2.appendChild(new Input_Group({title: `${line._action} Line ID`, text: line._id, link: `/stores/${line._action.toLowerCase()}_lines/${line._id}`}).e)
    } else if (line._status === 4) {
        nav_body_2.appendChild(new Input_Group({title: 'Declined',    text: print_date(line._date)}).e);
        nav_body_2.appendChild(new Input_Group({title: 'Declined By', text: user_name(line.user_approve), link: `/stores/users/${line.approved_by}`}).e);
    };
    nav_body_3.appendChild(new Modal_Notes({id: `line_${line.line_id}`}).e);
    nav_bodies.appendChild(nav_body_1);
    nav_bodies.appendChild(nav_body_2);
    nav_bodies.appendChild(nav_body_3);
    nav.appendChild(nav_bodies);
    mdl_body.appendChild(nav);
    let select = document.querySelector(`#sel_system_modal_line_${line.line_id}`),
        show_line_notes = function () {
            let select = document.querySelector(`#sel_system_modal_line_${line.line_id}`),
                query  = ['_table=request_lines', `_id=${line.line_id}`];
            if (select && select.value) query.push(select.value);
            get(
                showLineNotes,
                {
                    table: 'notes',
                    query: query,
                    line_id: line.line_id
                }
            );
        };
    if (select) select.addEventListener('change', show_line_notes);
    show_line_notes();

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
            }).e;
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
function showLineNotes (notes, options = {}) {
    let table_body = document.querySelector(`#note_lines_mdl_line_${options.line_id}`);
    table_body.innerHTML = '';
    notes.forEach(note => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(note.createdAt).getTime(),
            text: new Date(note.createdAt).toDateString()
        });
        add_cell(row, {text: note._note});
        add_cell(row, {text: user_name(note.user)});
    });
    hide_spinner('notes');
};