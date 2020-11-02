showOrder = (orders, options) => {
    if (orders.length === 1) {
        for (let [id, value] of Object.entries(orders[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === 'user_for' || id === 'user_by')  {
                    element.innerText = `${value.rank._rank} ${value.full_name}`;
                    let link = document.querySelector(`#${id}_link`);
                    link.setAttribute('href', `/stores/users/${value.user_id}`);
                } else if (id === 'createdAt' || id === 'updatedAt') {
                    element.innerText = `${new Date(value).toDateString()} ${new Date(value).toLocaleTimeString()}`
                } else if (id === '_status') {
                    if      (value === 0) element.innerText = 'Cancelled'
                    else if (value === 1) element.innerText = 'Draft';
                    else if (value === 2) element.innerText = 'Open'
                    else if (value === 3) element.innerText = 'Closed'
                    else element.innerText = 'Unknown';
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = orders[0].order_id;
        breadcrumb.href = `/stores/orders/${orders[0].order_id}`;

        ['action', 'complete', 'cancel', 'addSize', 'delete'].forEach(e => {
            document.querySelector(`#btn_${e}`).setAttribute('disabled', true);
        });
        if (orders[0]._status === 0) {
        } else if (orders[0]._status === 1) {
            if (options.permissions.edit) {
                document.querySelector('#btn_complete').removeAttribute('disabled');
                document.querySelector('#btn_cancel').removeAttribute('disabled');
            };
            if (options.permissions.line_add) {
                document.querySelector('#div_modals').appendChild(new Modal({id: 'add_size', static: true}).e);
                document.querySelector('#btn_addSize').removeAttribute('disabled');
                add_size_modal('order');
            };
            if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
        } else if (orders[0]._status === 2 || orders[0]._status === 3) {
            if (orders[0]._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
        };
    } else alert(`${orders.length} matching orders found`);
};