function showItems(items, options) {
    let div_items = document.querySelector('#div_items');
    div_items.innerHTML = '';
    items.forEach(item => {
        if (item.item_id !== 0 || options.permissions.pay_out) {
            let form   = document.createElement('form'),
                button = document.createElement('button');
            form.setAttribute('id', `form_${item.item_id}`);
            form.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-4', 'col-xl-3', 'mb-2', 'h-100');
            button.classList.add('w-100', 'h-100', 'btn', 'btn-primary');
            let button_text = `${item._name}`;
            if (item.item_id !== 0) button_text += `\n£${Number(item._price).toFixed(2)}`
            button.innerText = button_text;
            form.appendChild(button);
            form.appendChild(new Input({type: 'hidden', name: 'line[sale_id]', value: '', classes: ['sale_id']}).e);
            form.appendChild(new Input({type: 'hidden', name: 'line[item_id]', value: String(item.item_id)}).e);
            div_items.appendChild(form);
            addFormListener(`form_${item.item_id}`, 'POST', "/canteen/sale_lines", {onComplete: getSaleLines, noConfirm: true});
        };
    });
    items_loaded = true;
    load_check();
};