function showItems(items, options) {
    let table_body = document.querySelector('#tbl_items');
    table_body.innerHTML = '';
    items.forEach(item => {
        if (item.item_id !== 0) {
            let row = table_body.insertRow(-1);
            add_cell(row, {text: item._name});
            add_cell(row, {text: `£${Number(item._price).toFixed(2)}`});
            add_cell(row, {text: item._qty || '0'});
            if (item._current) add_cell(row, {text: 'Yes'})
            else add_cell(row, {text: 'No'})
            add_cell(row, {append: new Link({
                href: `/canteen/items/${item.item_id}`,
                small: true
            }).e});
        };
    });
    let div_modals = document.querySelector('#div_modals');
    div_modals.innerHTML = '';
    if (options.permissions.item_add) {
        div_modals.appendChild(new Modal({
            id: 'add_item',
            static: true,
            title: 'Add Item'
        }).e);
        let mdl_add_item_body  = document.querySelector('#mdl_add_item_body');
        if (mdl_add_item_body) {
            let form = document.createElement('form');
            form.setAttribute('id', 'form_add_item')
            form.appendChild(new Input_Group({title: 'Name',    append: new Input({ required: true, name: 'item[_name]'}).e}).e);
            form.appendChild(new Input_Group({title: 'Price',   append: new Input({ required: true, name: 'item[_price]', type: 'number', value: '0.50', step: '0.01'}).e}).e);
            form.appendChild(new Input_Group({title: 'Cost',    append: new Input({ required: true, name: 'item[_cost]',  type: 'number', value: '0.50', step: '0.01'}).e}).e);
            form.appendChild(new Input_Group({title: 'Stock',   append: new Input({ required: true, name: 'item[_qty]',   type: 'number', value: '0'}).e}).e);
            form.appendChild(new Input_Group({title: 'Current', append: new Select({required: true, name: 'item[_current]', options: [{value: '1', text: 'Yes', selected: true},{value: '0', text: 'No'}]}).e}).e);
            form.appendChild(new Input({id: 'item_save', type: 'submit', value: 'Save', classes: ['btn', 'btn-success']}).e);
            mdl_add_item_body.appendChild(form);
            addFormListener(
                'form_add_item',
                'POST',
                `/canteen/items`,
                {onComplete: [window.getItems, function () {$('#mdl_add_item').modal('hide')}]}
            );
        };


        let btn_add_item = document.querySelector('#btn_add_item');
        if (btn_add_item) btn_add_item.setAttribute('href', 'javascript:$("#mdl_add_item").modal("show")');
    };
    hide_spinner('items');
};