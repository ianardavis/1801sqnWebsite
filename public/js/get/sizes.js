getSizes = (item_id) => {
    show_spinner('items');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#sizeTable'),
            size_count = document.querySelector('#size_count');
        if (response.sizes) size_count.innerText = response.sizes.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.sizes.forEach(size => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: size._size});
                add_cell(row, {text: size.locationStock});
                add_cell(row, {append: link('/stores/sizes/' + size.size_id, false)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('items');
    });
    XHR_send(XHR, 'items', '/stores/get/sizes?item_id=' + item_id);
};