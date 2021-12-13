function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'sizes',
            query: [`"item_id":"${path[2]}"`],
            ...sort_query(tbl_sizes)
        })
        .then(function ([sizes, options]) {
            set_count('size', sizes.length || '0');
            sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {text: size.size1});
                add_cell(row, {text: size.size2});
                add_cell(row, {text: size.size3});
                add_cell(row, {append: new Link({href: `/sizes/${size.size_id}`}).e});
            });
        });
    });
};
addReloadListener(getSizes);