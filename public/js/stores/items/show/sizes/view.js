function getSizes() {
    let table_body = document.querySelector('#tbl_sizes');
    if (table_body) {
        table_body.innerHTML = '';
        get(
            {
                table: 'sizes',
                query: [`item_id=${path[2]}`]
            },
            function (sizes, options) {
                set_count({id: 'size', count: sizes.length || '0'});
                sizes.forEach(size => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: size._size});
                    add_cell(row, {append: 
                        new Link({
                            href: `/stores/sizes/${size.size_id}`,
                            small: true
                        }).e
                    });
                });
            }
        );
    };
};
window.addEventListener('load', function () {
    document.querySelector('#reload').addEventListener('click', getSizes);
});