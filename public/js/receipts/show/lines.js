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
        } catch (error) {
            console.log(error)
            console.log(`Error loading line ${line.line_id}: ${error}`)
        };
    });
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
    mdl_body.appendChild(new Input_Group({title: 'Added By', text: print_user(line.user), link: `/stores/users/${line.user_id}`}).e);
    mdl_body.appendChild(new Input_Group({title: 'Status',   text: statuses[line._status]}).e);
    mdl_body.appendChild(document.createElement('hr'));
    mdl_body.appendChild(new Input_Group({title: 'Location', text: line.location._location}).e);
    if(line.serial) mdl_body.appendChild(new Input_Group({title: 'Serial', text: line.serial._serial}).e);
    
};