let statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3': 'Demanded', '4': 'Received', '5': 'Issued', '6': 'Closed'};
function enterSerial (line_id) {
    let _cell = document.querySelector(`#serials_${line_id}`);
    _cell.appendChild(
        new Input({
            attributes: [
                {field: 'name',        value: `actions[line_id${line_id}][_serial]`},
                {field: 'placeholder', value: 'Serial #'},
                {field: 'required',    value: true},
                {field: 'maxlength',   value: '45'}
            ],
            small: true,
        }).e
    );
    _cell.appendChild(
        new Input({
            attributes: [
                {field: 'name',        value: `actions[line_id${line_id}][_location]`},
                {field: 'placeholder', value: 'Location'},
                {field: 'required',    value: true},
                {field: 'maxlength',   value: '20'}
            ],
            small: true
        }).e
    );
};
function add_modal (line) {
    document.querySelector(`#div_modals`).appendChild(
        new Modal({
            id: line.line_id,
            static: true,
            tabs: true,
            size: line.size,
            table: 'request_lines'
        }).e
    );
    get_line_notes({id: line.line_id, table: 'issue_lines'});
    let nav_body_1 = document.querySelector(`#mdl_line_${line.line_id}_body_1`),
        nav_body_2 = document.querySelector(`#mdl_line_${line.line_id}_body_2`),
        mdl_title = document.querySelector(`#mdl_${line.line_id}_title`);
    mdl_title.innerText = `Issue Line ${line.line_id}`;
    nav_body_1.appendChild(new Input_Group({title: 'Qty',      text: line._qty}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Status',   text: statuses[String(line._status)] || 'Unknown'}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Added',    text: print_date(line.createdAt, true)}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Added By', text: print_user(line.user), link: `/stores/users/${line.user_id}`}).e);
};
function getLines() {
    get(
        function (lines, options) {
            clearElement('tbl_lines');
            let table_body = document.querySelector('#tbl_lines');
            if (lines) document.querySelector('#line_count').innerText = lines.length || '0';
            lines.forEach(line => {
                try {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: line.line_id});
                    add_cell(row, {text: line.size.item._description});
                    add_cell(row, {text: line.size._size});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {id: `cell_status_${line.line_id}`});
                    add_cell(row, {id: `cell_action_${line.line_id}`});
                    add_cell(row, {append: new Modal_Link({id: `${line.line_id}`}).e, id: `mdl_cell_${line.line_id}`});
                    add_modal(line);
                    if (line._status !== 5 && line._status !== 0) {
                        let mdl_header = document.querySelector(`#mdl_${line.line_id}_header`);
                        mdl_header.appendChild(
                            new DeleteButton({
                                path: `/stores/issue_lines/${line.line_id}`,
                                float: true,
                                options: {onComplete: getLines}
                            }).e
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
                        if (line.issue._status === 2) {
                            action_options.push({value: '0', text: 'Cancel'});
                            action_options.push({value: '3', text: 'Demand'});
                            action_options.push({value: '4', text: 'Receive'});
                            if (line.issue.issueed_for !== -1) action_options.push({value: '5', text: 'Issue'});
                        };
                    } else if (line._status === 3) { //If Demanded
                        if (line.issue._status === 2) {
                            action_options.push({value: '0', text: 'Cancel'});
                            action_options.push({value: '4', text: 'Receive'});
                            if (line.issue.issueed_for !== -1) action_options.push({value: '5', text: 'Issue'});
                        };
                    } else if (line._status === 4) { //If Received
                        if (line.issue.issueed_for !== -1) {
                            if (line.issue._status === 2) {
                                action_options.push({value: '0', text: 'Cancel'});
                                action_options.push({value: '5', text: 'Issue'});
                            };
                        } else action_options.push({value: '6', text: 'Mark as Complete'});
                    } else if (line._status === 5) { //If Issued
                        cell_status.innerText = 'Issued';
                        if (line.issue._status === 2) action_options.push({value: '6', text: 'Mark as Complete'});
                    };
                    if (line.issue._status === 2) {
                        let div_actions = document.createElement('div'),
                            div_details = document.createElement('div'),
                            div_stocks  = document.createElement('div'),
                            div_nsns    = document.createElement('div'),
                            div_serials = document.createElement('div');
                        let _status = new Select({
                            attributes: [
                                {field: 'id',   value: `sel_${line.line_id}`},
                                {field: 'name', value: `actions[line_id${line.line_id}][_status]`}
                            ],
                            small: true,
                            options: action_options
                        }).e;
                        _status.addEventListener("change", function () {
                            ['details', 'serials', 'nsns', 'stocks'].forEach(e => clearElement(`${e}_${line.line_id}`))
                            if (this.value === '4') {
                                if (line.size._serials) {
                                    enterSerial(line.line_id);
                                } else {
                                    getStock(line.size_id, line.line_id, 'stocks');
                                };
                            } else if (this.value === '5') {
                                getStock(line.size_id, line.line_id, 'stocks');
                                if (line.size._serials) getSerials(line.size_id, line.line_id, 'serials');
                                if (line.size._nsns)    getNSNs(line.size_id, line.line_id, 'nsns', line.size.nsn_id);
                            };
                        });
                        div_details.setAttribute('id', `details_${line.line_id}`);
                        div_stocks.setAttribute('id', `stocks_${line.line_id}`);
                        div_nsns.setAttribute('id', `nsns_${line.line_id}`);
                        div_serials.setAttribute('id', `serials_${line.line_id}`);
                        div_actions.appendChild(_status);
                        div_actions.appendChild(div_details);
                        div_actions.appendChild(div_stocks);
                        div_actions.appendChild(div_serials);
                        div_actions.appendChild(div_nsns);
                        cell_action.appendChild(div_actions);
                    };
                } catch (error) {
                    console.log(`Error loading line ${line.line_id}: ${error}`)
                };
            });
        },
        {
            table: 'issue_lines',
            query: [`issue_id=${path[3]}`, sel_status.value]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getLines);
document.querySelector('#sel_status').addEventListener('change', getLines);