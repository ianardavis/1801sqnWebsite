function getSizes() {
    get(
        function (sizes, options) {
            clearElement('sizeTable');
            set_count({id: 'size', count: sizes.length || '0'});
            let table_body = document.querySelector('#sizeTable');
            if (table_body) {
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
            };
        },
        {
            table: 'sizes',
            query: [`item_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSizes);