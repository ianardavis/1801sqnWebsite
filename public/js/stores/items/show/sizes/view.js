function get_sizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        function add_line(size) {
            let row = tbl_sizes.insertRow(-1);
            add_cell(row, {text: size.size1});
            add_cell(row, {text: size.size2});
            add_cell(row, {text: size.size3});
            add_cell(row, {append: new Link(`/sizes/${size.size_id}`).e});
        };
        get({
            table: 'sizes',
            where: {item_id: path[2]},
            like: {
                ...filter_size('size')
            },
            func: get_sizes
        })
        .then(function ([result, options]) {
            setCount('size', result.count);
            result.sizes.forEach(size => {
                add_line(size);
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', get_sizes);
    add_sort_listeners('sizes', get_sizes);
    get_sizes();
});