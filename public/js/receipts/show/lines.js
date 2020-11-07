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
            add_cell(row, {text: statuses[String(line._status)]});
            add_modal(line, row);
            if (line._status === 1 && options.permissions.line_delete) {
                let mdl_header = document.querySelector(`#mdl_${line.line_id}_header`);
                mdl_header.appendChild(
                    new DeleteButton({
                        path: `/stores/receipt_lines/${line.line_id}`,
                        float: true,
                        options: {onComplete: getLines}
                    }).e
                );
            };
        } catch (error) {
            console.log(error)
            console.log(`Error loading line ${line.line_id}: ${error}`)
        };
    });
};
function add_modal (line, row) {
    add_cell(row, {append: new Modal_Link({id: `${line.line_id}`}).e, id: `mdl_cell_${line.line_id}`});
    document.querySelector(`#div_modals`).appendChild(
        new Modal({
            id: line.line_id,
            static: true,
            tabs: true,
            size: line.size,
            table: 'request_lines'
        }).e
    );
    get_line_notes({id: line.line_id, table: 'receipt_lines'});
    let nav_body_1 = document.querySelector(`#mdl_line_${line.line_id}_body_1`),
        nav_body_2 = document.querySelector(`#mdl_line_${line.line_id}_body_2`),
        mdl_title = document.querySelector(`#mdl_${line.line_id}_title`);
    mdl_title.innerText = `Receipt Line ${line.line_id}`;
    nav_body_1.appendChild(new Input_Group({title: 'Qty',      text: line._qty}).e);
    if (line.serial) nav_body_1.appendChild(new Input_Group({title: 'Serial', text: line.serial._serial}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Status',   text: statuses[String(line._status)] || 'Unknown'}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Added',    text: print_date(line.createdAt, true)}).e);
    nav_body_2.appendChild(new Input_Group({title: 'Added By', text: print_user(line.user), link: `/stores/users/${line.user_id}`}).e);
    if (line._status === 1) {
        //
    } else if (line._status === 2) {
        //
    } else if (line._status === 3) {
        nav_body_2.appendChild(new Input_Group({title: 'Approved',    text: print_date(line._date)}).e);
        nav_body_2.appendChild(new Input_Group({title: 'Approved By', text: print_user(line.user_approve), link: `/stores/users/${line.approved_by}`}).e);
        nav_body_2.appendChild(new Input_Group({title: 'Action',      text: line._action}).e)
        nav_body_2.appendChild(new Input_Group({title: `${line._action} Line ID`, text: line._id, link: `/stores/${line._action.toLowerCase()}_lines/${line._id}`}).e)
    } else if (line._status === 4) {
        nav_body_2.appendChild(new Input_Group({title: 'Declined',    text: print_date(line._date)}).e);
        nav_body_2.appendChild(new Input_Group({title: 'Declined By', text: print_user(line.user_approve), link: `/stores/users/${line.approved_by}`}).e);
    };   
};