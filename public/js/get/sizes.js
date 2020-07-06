getSizes = (query = [], part = false) => {
    show_spinner('sizes');
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
                if (part) add_cell(row, {text: size.item._description, ellipsis: true})
                add_cell(row, {text: size._size});
                add_cell(row, {text: size.locationStock});
                add_cell(row, {append: new Link({
                    href: '/stores/sizes/' + size.size_id,
                    type: 'show',
                    small: true
                }).link});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('sizes');
    });
    XHR_send(XHR, 'sizes', '/stores/get/sizes?' + query.join('&'));
};