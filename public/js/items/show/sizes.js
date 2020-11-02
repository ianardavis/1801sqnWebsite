showSizes = (sizes, options) => {
    let table_body = document.querySelector('#sizeTable'),
        size_count = document.querySelector('#size_count');
    if (sizes) size_count.innerText = sizes.length;
    table_body.innerHTML = '';
    sizes.forEach(size => {
        let row = table_body.insertRow(-1);
        add_cell(row, {text: size._size});
        add_cell(row, {text: size.locationStock});
        add_cell(row, {append: new Link({
            href: '/stores/sizes/' + size.size_id,
            type: 'show',
            small: true
        }).e});
    });
    hide_spinner('sizes');
}