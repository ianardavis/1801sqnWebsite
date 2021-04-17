function getSizes() {
    clear_table('sizes')
    .then(tbl_sizes => {
        get({
            table: 'sizes',
            query: [`item_id=${path[2]}`]
        })
        .then(function ([sizes, options]) {
            set_count({id: 'size', count: sizes.length || '0'});
            sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {text: size.size});
                add_cell(row, {append: 
                    new Link({
                        href: `/sizes/${size.size_id}`,
                        small: true
                    }).e
                });
            });
        });
    })
    .catch(err => console.log(err));
};
addReloadListener(getSizes);