function showItems(items, options) {
    let div_items = document.querySelector('#div_items');
    div_items.innerHTML = '';
    window.getSale = function() {
        get(
            showSale,
            {
                db: 'canteen',
                table: 'sale',
                query: []
            }
        );
    };
    items.forEach(item => {
        if (item.item_id !== 0 || options.permissions.pay_out) {
            let col      = document.createElement('div'),
                card     = document.createElement('div'),
                form     = document.createElement('form'),
                header   = document.createElement('div'),
                title    = document.createElement('h4'),
                body     = document.createElement('div'),
                body_p   = document.createElement('p'),
                inp_sale = new Input({type: 'hidden', name: 'line[sale_id]', value: '', classes: ['sale_id']}).e,
                inp_item = new Input({type: 'hidden', name: 'line[item_id]', value: item.item_id}).e,
                inp_save = new Button({text: 'Add', classes: ['w-100', 'mt-auto']}).e
            col.classList.add('col-6', 'col-md-6', 'col-xl-3', 'mb-2');
            card.classList.add('card', 'h-100');
            form.setAttribute('id', `form_${item.item_id}`);
            form.classList.add('h-100');
            header.classList.add('card-header', 'py-1', 'h-40','d-flex', 'flex-column');
            title.innerText = item._name;
            header.appendChild(title);
            if (item.item_id !== 0) {
                let subtitle = document.createElement('p');
                subtitle.classList.add('card-subtitle', 'float-left', 'text-left', 'text-muted', 'mt-auto');
                subtitle.innerText = `£${Number(item._price).toFixed(2)}`;
                header.appendChild(subtitle);
            };
            body.classList.add('card-body','d-flex', 'flex-column', 'h-60');
            body.appendChild(inp_sale);
            body.appendChild(inp_item);
            if (item.item_id === 0) {
                body_p.appendChild(new Input({
                    type:     'number',
                    name:     'line[_price]',
                    value:    '1.00',
                    min:      '0.01',
                    step:     '0.01',
                    required: true
                }).e);
            } else {
                body_p.appendChild(new Input({
                    type:     'number',
                    name:     'line[_qty]',
                    value:    '1',
                    min:      '1',
                    required: true
                }).e);
            };
            body.appendChild(body_p);
            body.appendChild(inp_save);
            form.appendChild(header);
            form.appendChild(body);
            card.appendChild(form);
            col.appendChild(card);
            div_items.appendChild(col);
            addFormListener(`form_${item.item_id}`, 'POST', "/canteen/sale_lines", {onComplete: [getSale], noConfirm: true});
        };
    });
    getSale();
};