function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'sizes',
            where: {item_id: path[2]}
        })
        .then(function ([sizes, options]) {
            set_count('size', sizes.length);
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