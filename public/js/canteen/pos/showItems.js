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
                subtitle = document.createElement('p'),
                body     = document.createElement('div'),
                inp_sale = new Input({type: 'hidden', name: 'line[sale_id]', value: '', classes: ['sale_id']}).e,
                inp_item = new Input({type: 'hidden', name: 'line[item_id]', value: item.item_id}).e,
                body_p   = document.createElement('p'),
                inp_qty  = new Input({type: 'number', name: 'line[_qty]', value: '1', min: '1', required: true}).e,
                inp_save = new Button({text: 'Add', classes: ['w-100', 'mt-auto']}).e
            col.classList.add('col-12', 'col-md-6', 'col-xl-3', 'mb-2');
            card.classList.add('card', 'h-100');
            form.setAttribute('id', `form_${item.item_id}`);
            form.classList.add('h-100');
            header.classList.add('card-header', 'py-1', 'h-40','d-flex', 'flex-column');
            title.innerText = item._name;
            subtitle.classList.add('card-subtitle', 'text-left', 'text-muted', 'mt-auto');
            if (item.item_id !== 0) subtitle.innerText = `£${Number(item._price).toFixed(2)}`;
            body.classList.add('card-body','d-flex', 'flex-column', 'h-60')
            header.appendChild(title);
            header.appendChild(subtitle);
            body.appendChild(inp_sale);
            body.appendChild(inp_item);
            body_p.appendChild(inp_qty);
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



// <% items.forEach(item => { %>
//     <% if (item.item_id !== 0 || permissions.canteen_supervisor) { %>
//         <div class="col-6 col-xl-4 mb-2">
//             <div class="card">
//                 <form action="/canteen/sale_lines" method='POST'>
//                     <div class="card-header py-1">
//                         <h3><%= item._name %></h3>
//                         <p class="card-subtitle text-left text-muted">
//                             <% if (item.item_id !== 0) { %>
//                                 £<%= item._price %>
//                             <% } %>
//                         </p>
//                     </div>
//                     <div class="card-body pt-1">
//                         <input type="hidden" name='sale_line[sale_id]' value='<%= sale_id %>'>
//                         <input type="hidden" name='sale_line[item_id]' value='<%= item.item_id %>'>
//                         <p>
//                             <% if (item.item_id !== 0) { %>
//                                 Qty: <input class='form-control' type="number" name='sale_line[_qty]' value='1' required>
//                             <% } else { %>
//                                 <input type="hidden" name='sale_line[_qty]' value='1' required>
//                                 <input class='form-control' type="number" name='sale_line[_price]' value='' required>
//                             <% } %>
//                         </p>
//                         <button class='btn btn-lg btn-success w-100'>Add</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     <% } %>
// <% }) %>