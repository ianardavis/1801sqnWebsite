function get_sizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'sizes',
            ...build_filter_query('size', {item_id: path[2]}),
            func: get_sizes
        })
        .then(function ([result, options]) {
            set_count('size', result.count);
            result.sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {text: size.size1});
                add_cell(row, {text: size.size2});
                add_cell(row, {text: size.size3});
                add_cell(row, {append: new Link(`/sizes/${size.size_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', get_sizes);
    add_sort_listeners('sizes', get_sizes);
    get_sizes();
});