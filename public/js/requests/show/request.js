showRequest = (requests, options) => {
    if (requests.length === 1) {
        let _toast = document.querySelector('#incompleteToast');
        if (_toast) _toast.remove();
        for (let [id, value] of Object.entries(requests[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === 'user_for' || id === 'user_by')  {
                    element.innerText = `${value.rank._rank} ${value.full_name}`;
                    let link = document.querySelector(`#${id}_link`);
                    link.setAttribute('href', `/stores/users/${value.user_id}`);
                } else if (id === 'createdAt' || id === 'updatedAt') {
                    element.innerText = `${new Date(value).toDateString()} ${new Date(value).toLocaleTimeString()}`
                } else if (id === '_status') {
                    if (value === 0) element.innerText = 'Cancelled'
                    else if (value === 1) {
                        element.innerText = 'Draft';
                        document.querySelector('#main_container').insertBefore(new Toast({
                            id: 'incompleteToast',
                            title: 'Incomplete Request',
                            text: "This request is still in draft, no items on this request will be actioned or considered until the request is marked as 'Complete'"
                        }).toast, document.querySelector('mainTab'));
                        $('#incompleteToast').toast('show');
                    } else if (value === 2) element.innerText = 'Open'
                    else if (value === 3) element.innerText = 'Complete'
                    else element.innerText = 'Unknown';
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = requests[0].request_id;
        breadcrumb.href = `/stores/requests/${requests[0].request_id}`;
        
        document.querySelectorAll('#table_header_lines tr th').forEach(e => {
            if (!['line_id', 'col_item', 'col_size', 'col_qty'].includes(e.id)) e.remove()
            else e.removeAttribute('class');
        });
        document.querySelector('#btn_action').setAttribute('disabled', true);
        document.querySelector('#btn_complete').setAttribute('disabled', true);
        document.querySelector('#btn_cancel').setAttribute('disabled', true);
        document.querySelector('#btn_addSize').setAttribute('disabled', true);
        document.querySelector('#btn_delete').setAttribute('disabled', true);
        let line_id     = document.querySelector('#line_id'),
            col_item    = document.querySelector('#col_item'),
            col_size    = document.querySelector('#col_size'),
            col_qty     = document.querySelector('#col_qty');
        if (requests[0]._status === 0 || requests[0]._status === 1) {
            line_id.classList.add('w-10');
            col_item.classList.add('w-40');
            col_size.classList.add('w-40');
            col_qty.classList.add('w-10');
            if (requests[0]._status === 1) {
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
                    document.querySelector('#form_addSize').setAttribute('action', `javascript:addSize("request",${requests[0].request_id})`)
                    document.querySelector('#btn_addSize').removeAttribute('disabled');
                };
                if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
            };
        } else if (requests[0]._status === 2 || requests[0]._status === 3) {
            if (requests[0]._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
            line_id.classList.add('w-10');
            col_item.classList.add('w-30');
            col_size.classList.add('w-30');
            col_qty.classList.add('w-10');
            let header_row = document.querySelector('#table_header_lines tr');
            header_row.appendChild(new Column({
                id: 'col_status',
                text: 'Status',
                classes: ['w-20'],
                onclick: "sortTable(3,'linesTable')"
            }).th);
            header_row.appendChild(new Column({
                id: 'col_view',
                html: '<i class="fas fa-search"></i>'
            }).th);
        };
    } else alert(`${requests.length} matching requests found`);
};