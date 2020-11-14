showItem = (items, options) => {
    if (items.length === 1) {
        for (let [id, value] of Object.entries(items[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === '_current') {
                    if (element) element.innerText = yesno(value);
                } else if (id === 'item_id') {
                    let item_ids = document.querySelectorAll('.item_id');
                    console.log(item_ids);
                    item_ids.forEach(e => e.setAttribute('value', value));
                } else if (element) element.innerText = value;
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = items[0]._name;
        breadcrumb.href = `/canteen/items/${items[0].item_id}`;

        let div_modals = document.querySelector('#div_modals');
        div_modals.innerHTML = '';
        if (div_modals) {
            if (options.permissions.edit) {
                div_modals.appendChild(new Modal({
                    id: 'edit_item',
                    static: true,
                    title: 'Edit Item'
                }).e);
                let mdl_edit_item_body  = document.querySelector('#mdl_edit_item_body');
                if (mdl_edit_item_body) {
                    let form = document.createElement('form');
                    form.setAttribute('id', 'form_edit_item')
                    form.appendChild(new Input_Group({title: 'Name',    append: new Input({ required: true, name: 'item[_name]',                  value: items[0]._name}).e}).e);
                    form.appendChild(new Input_Group({title: 'Price',   append: new Input({ required: true, name: 'item[_price]', type: 'number', value: items[0]._price, step: '0.01'}).e}).e);
                    form.appendChild(new Input_Group({title: 'Cost',    append: new Input({ required: true, name: 'item[_cost]',  type: 'number', value: items[0]._cost,  step: '0.01'}).e}).e);
                    form.appendChild(new Input_Group({title: 'Current', append: new Select({required: true, name: 'item[_current]', options: [{value: '1', text: 'Yes', selected: (items[0]._current === 1)},{value: '0', text: 'No', selected: (items[0]._current === 0)}]}).e}).e);
                    form.appendChild(new Input({id: 'item_save', type: 'submit', value: 'Save', classes: ['btn', 'btn-success']}).e);
                    mdl_edit_item_body.appendChild(form);
                    addFormListener(
                        'form_edit_item',
                        'PUT',
                        `/canteen/items/${path[3]}`,
                        {onComplete: [window.getItem, function () {$('#mdl_edit_item').modal('hide')}]}
                    );
                };
                let btn_edit_item = document.querySelector('#edit_link');
                if (btn_edit_item) btn_edit_item.setAttribute('href', 'javascript:$("#mdl_edit_item").modal("show")');
            };


        };
        
        let add_size = document.querySelector('#add_size');
        if (add_size) add_size.href = `javascript:add("sizes",{"queries":"item_id=${items[0].item_id}"})`;
    } else alert(`${items.length} matching items found`);
};