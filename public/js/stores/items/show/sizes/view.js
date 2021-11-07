function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        let sort_cols = tbl_sizes.parentNode.querySelector('.sort') || null;
        get({
            table: 'sizes',
            query: [`"item_id":"${path[2]}"`],
            ...sort_query(sort_cols)
        })
        .then(function ([sizes, options]) {
            set_count({id: 'size', count: sizes.length || '0'});
            sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {text: size.size1});
                add_cell(row, {text: size.size2});
                add_cell(row, {text: size.size3});
                add_cell(row, {append: 
                    new Link({
                        href: `/sizes/${size.size_id}`,
                        small: true
                    }).e
                });
            });
        });
    });
};
addReloadListener(getSizes);