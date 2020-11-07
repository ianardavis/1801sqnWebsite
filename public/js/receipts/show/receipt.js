showReceipt = (receipts, options) => {
    if (receipts.length === 1) {
        for (let [id, value] of Object.entries(receipts[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === 'supplier')  {
                    element.innerText = value._name;
                    let link = document.querySelector(`#${id}_link`);
                    link.setAttribute('href', `/stores/suppliers/${value.supplier_id}`);
                } else if (id === 'user')  {
                    element.innerText = print_user(value);
                    let link = document.querySelector(`#${id}_link`);
                    link.setAttribute('href', `/stores/users/${value.user_id}`);
                } else if (id === 'createdAt' || id === 'updatedAt') {
                    element.innerText = print_date(value, true);
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
        breadcrumb.innerText = receipts[0].receipt_id;
        breadcrumb.href = `/stores/receipts/${receipts[0].receipt_id}`;

        ['complete', 'addSize', 'delete'].forEach(e => {
            document.querySelector(`#btn_${e}`).setAttribute('disabled', true);
        });
        if (receipts[0]._status === 0) {
        } else if (receipts[0]._status === 1) {
            if (options.permissions.edit) {
                document.querySelector('#btn_complete').removeAttribute('disabled');
                document.querySelector('#btn_cancel').removeAttribute('disabled');
            };
            if (options.permissions.line_add) {
                document.querySelector('#div_modals').appendChild(new Modal({id: 'add_size', static: true}).e);
                document.querySelector('#btn_addSize').removeAttribute('disabled');
                add_size_modal('receipt', {locations: true, serials: true});
            };
            if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
        } else if (receipts[0]._status === 2 || receipts[0]._status === 3) {
            if (receipts[0]._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
        };
    } else alert(`${receipts.length} matching receipts found`);
};