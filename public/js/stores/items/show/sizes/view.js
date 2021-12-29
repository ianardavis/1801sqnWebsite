function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'sizes',
            where: {item_id: path[2]},
            func: getSizes
        })
        .then(function ([result, options]) {
            set_count('size', result.count);
            result.sizes.forEach(size => {
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
sort_listeners(
    'sizes',
    getSizes,
    [
        {value: '["createdAt"]', text: 'Created'},
        {value: '["size1"]',     text: 'Size 1', selected: true},
        {value: '["size2"]',     text: 'Size 2'},
        {value: '["size3"]',     text: 'Size 3'}
    ]
);