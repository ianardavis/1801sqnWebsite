showOrder = (orders, options) => {
    if (orders.length === 1) {
        for (let [id, value] of Object.entries(orders[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === '_for')  {
                    element.innerText = `${value.rank._rank} ${value.full_name}`;
                    let for_link = document.querySelector('#for_link');
                    for_link.setAttribute('href', `/stores/users/${value.user_id}`);
                } else if (id === '_by') {
                    element.innerText = `${value.rank._rank} ${value.full_name}`;
                    let by_link = document.querySelector('#by_link');
                    by_link.setAttribute('href', `/stores/users/${value.user_id}`);
                } else if (id === '_date') element.innerText = `${new Date(value).toDateString()} ${new Date(value).toLocaleTimeString()}`
                else if (id === '_status') {
                    if      (value === 0) element.innerText = 'Cancelled'
                    else if (value === 1) element.innerText = 'Draft';
                    else if (value === 2) element.innerText = 'Open'
                    else if (value === 3) element.innerText = 'Complete'
                    else element.innerText = 'Unknown';
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = orders[0].order_id;
        breadcrumb.href = `/stores/orders/${orders[0].order_id}`;

        document.querySelectorAll('#table_header_lines tr th').forEach(e => {
            if (!['line_id', 'col_item', 'col_size', 'col_qty'].includes(e.id)) e.remove()
            else e.removeAttribute('class');
        });
        document.querySelector('#btn_action').setAttribute('disabled', true);
        document.querySelector('#btn_complete').setAttribute('disabled', true);
        document.querySelector('#btn_cancel').setAttribute('disabled', true);
        document.querySelector('#btn_addSize').setAttribute('disabled', true);
        document.querySelector('#btn_delete').setAttribute('disabled', true);
        let line_id  = document.querySelector('#line_id'),
            col_item = document.querySelector('#col_item'),
            col_size = document.querySelector('#col_size'),
            col_qty  = document.querySelector('#col_qty');
        if (orders[0]._status === 0 || orders[0]._status === 1) {
            line_id.classList.add('w-10');
            col_item.classList.add('w-40');
            col_size.classList.add('w-40');
            col_qty.classList.add('w-10');
            if (orders[0]._status === 1) {
                if (options.permissions.line_delete) {
                    document.querySelector('#table_header_lines tr').appendChild(new Column({
                        id: 'col_delete',
                        html: '<i class="fas fa-trash-alt"></i>'
                    }).th);
                };
                if (options.permissions.edit) {
                    document.querySelector('#btn_complete').removeAttribute('disabled');
                    document.querySelector('#btn_cancel').removeAttribute('disabled');
                };
                if (options.permissions.line_add) {
                    document.querySelector('#form_addSize').setAttribute('action', `javascript:addSize("order",${orders[0].order_id})`)
                    document.querySelector('#btn_addSize').removeAttribute('disabled');
                };
                if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
            };
        } else if (orders[0]._status === 2 || orders[0]._status === 3) {
            if (orders[0]._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
            line_id.classList.add('w-5');
            col_item.classList.add('w-15');
            col_size.classList.add('w-15');
            col_qty.classList.add('w-5');
            let header_row = document.querySelector('#table_header_lines tr');
            header_row.appendChild(new Column({
                id: 'col_action',
                text: 'Action',
                classes: ['w-15'],
                onclick: "sortTable(3,'orderTable')"
            }).th);
            header_row.appendChild(new Column({
                id: 'col_demanded',
                text: 'Demand Date',
                classes: ['w-15'],
                onclick: "sortTable(4,'orderTable')"
            }).th);
            header_row.appendChild(new Column({
                id: 'col_received',
                text: 'Receipt Date',
                classes: ['w-15'],
                onclick: "sortTable(5,'orderTable')"
            }).th);
            if (orders[0].ordered_for !== -1) {
                header_row.appendChild(new Column({
                    id: 'col_issued',
                    text: 'Issue Date',
                    classes: ['w-15'],
                    onclick: "sortTable(6,'orderTable')"
                }).th);
            };
        };
    } else alert(`${orders.length} matching orders found`);
};