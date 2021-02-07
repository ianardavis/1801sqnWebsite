function getLines() {
    get(
        {
            db: 'canteen',
            table: 'writeoff_lines',
            query: [`writeoff_id=${path[3]}`]
        },
        function (lines, options) {
            try {
                clearElement('tbl_writeoff_lines');
                clearElement('div_line_modals');
                let tbl_writeoff_lines = document.querySelector('#tbl_writeoff_lines'),
                    line_count         = document.querySelector('#line_count'),
                    div_line_modals    = document.querySelector('#div_line_modals');
                line_count.innerText = lines.length || '0';
                lines.forEach(line => {
                    try {
                        let row = tbl_writeoff_lines.insertRow(-1);
                        add_cell(row, {text: line.item._name});
                        add_cell(row, {text: line._qty});
                        add_cell(row, {text: line._cost});
                        add_cell(row, {append: new Link({
                            href: `javascript:$("#mdl_line_${line.line_id}").modal("show")`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(`Error showing line ${line.line_id}`);
                        console.log(error);
                    };
                    if (div_line_modals) {
                        div_line_modals.appendChild(new Modal({
                            id: `line_${line.line_id}`,
                            title: `Writeoff Line ${line.line_id}`
                        }).e);
                        let mdl_body = document.querySelector(`#mdl_line_${line.line_id}_body`);
                        if (mdl_body) {
                            mdl_body.appendChild(new Input_Group({title: 'Added:',     text: print_date(line.createdAt)}).e);
                            mdl_body.appendChild(new Input_Group({title: 'Added By:',  text: print_user(line.user), link: `/canteen/users/${line.user_id}`}).e);
                            mdl_body.appendChild(new Input_Group({title: 'Item:',      text: line.item._name,       link: `/canteen/items/${line.item_id}`}).e);
                            mdl_body.appendChild(new Input_Group({title: 'Qty:',       text: line._qty}).e);
                            mdl_body.appendChild(new Input_Group({title: 'Cost Each:', text: `£${Number(line._cost).toFixed(2)}`}).e);
                        };
                    };
                });
            } catch (error) {
                console.log(error);
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getLines);