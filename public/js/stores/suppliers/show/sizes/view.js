function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        let sort_cols = tbl_sizes.parentNode.querySelector('.sort') || null;
        get({
            table: 'sizes',
            query: [`supplier_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([sizes, options]) {
            set_count({id: 'size', count: sizes.length || '0'});
            sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {text: size.item.description})
                add_cell(row, {text: print_size(size)});
                add_cell(row, {append: new Link({
                    href: `/sizes/${size.size_id}`,
                    small: true
                }).e});
            });
        });
    });
};
addReloadListener(getSizes);