getReceiptLines = (receipt_id, complete, delete_permission) => {
    show_spinner('receipts');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#receiptTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                if (line.stock) {
                    add_cell(row, {
                        text: line.stock.location._location,
                        append: link('javascript:show("stock",' + line.stock_id + ',{"height":300})')
                    });
                    add_cell(row, {
                        text: line.stock.size.item._description,
                        append: link('/stores/items/' + line.stock.size.item_id)
                    });
                    add_cell(row, {
                        text: line.stock.size._size,
                        append: link('/stores/sizes/' + line.stock.size.size_id)
                    });
                } else {
                    add_cell(row);
                    add_cell(row);
                    add_cell(row);
                };
                add_cell(row, {text: line._qty});
                if (delete_permission && !complete) add_cell(row, {append: deleteBtn('/stores/receipt_lines/' + line.line_id)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('receipts');
    });
    XHR_send(XHR, 'receipts', '/stores/get/receiptlines?receipt_id=' + receipt_id);
};