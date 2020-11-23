function showSaleLines(lines, options) {
    let btn_complete_sale = document.querySelector('#btn_complete_sale'),
        tbl_sale_lines    = document.querySelector('#tbl_sale_lines'),
        btn_finish        = document.querySelector('#btn_finish'),
        totals            = document.querySelectorAll('.total'),
        total             = 0;
    tbl_sale_lines.innerHTML = '';
    if (lines.length === 0) {
        btn_complete_sale.setAttribute('disabled', true);
        btn_finish.setAttribute('disabled', true);
    } else {
        btn_complete_sale.removeAttribute('disabled');
        btn_finish.removeAttribute('disabled');
        lines.forEach(line => {
            total += line._qty * line.item._price;
            let row = tbl_sale_lines.insertRow(-1);
            add_cell(row, {text: line.item._name});
            add_cell(row, {text: `£${Number(line._price).toFixed(2)}`});
            add_cell(row, {text: line._qty});
            add_cell(row, {text: `£${Number(line._qty * line._price).toFixed(2)}`});
            let form = document.createElement('form');
            form.setAttribute('id', `form_${line.line_id}_minus`)
            form.appendChild(new Input({type: 'hidden', name: 'line[line_id]', value: line.line_id}).e);
            form.appendChild(new Input({type: 'hidden', name: 'line[_qty]',    value: -1}).e);
            form.appendChild(new Button({html: '<i class="fas fa-minus"></i>', small: true}).e);
            add_cell(row, {append: form});
            addFormListener(`form_${line.line_id}_minus`, 'PUT', `/canteen/sale_lines`, {noConfirm: true, onComplete: [getSaleLines]});
        });
    };
    totals.forEach(e => {
        e.innerText = total.toFixed(2) || '0.00'
    });
};