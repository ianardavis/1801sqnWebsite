function showSaleLines(lines, options) {
    let tbl_sale_lines = document.querySelector('#tbl_sale_lines'),
        _total         = document.querySelector('#_total'),
        total          = 0;
    tbl_sale_lines.innerHTML = '';
    lines.forEach(line => {
        total += line._qty * line.item._price;
        let row = tbl_sale_lines.insertRow(-1);
        add_cell(row, {text: line.item._name});
        add_cell(row, {text: `£${line.item._price}`});
        add_cell(row, {text: line._qty});
        add_cell(row, {text: Number(line._qty * line.item._price).toFixed(2)});
        [
            {qty: 1,  html: '<i class="fas fa-minus"></i>'},
            {qty: -1, html: '<i class="fas fa-plus"></i>'}
        ].forEach(e => {
            let form = document.createElement('form');
            form.setAttribute('id', `form_${line.line_id}_${e.qty}`)
            form.appendChild(new Input({type: 'hidden', name: 'sale_line[line_id]', value: line.line_id}).e);
            form.appendChild(new Input({type: 'hidden', name: 'sale_line[_qty]',    value: e.qty}).e);
            form.appendChild(new Button({html: e.html}).e);
            add_cell(row, {append: form});
            addFormListener(`form_${line.line_id}_${e.qty}`, 'PUT', `/canteen/sale_lines`, {onComplete: [getSaleLines]});
        });
    });
    _total.innerText = total.toFixed(2) || '0.00'
};