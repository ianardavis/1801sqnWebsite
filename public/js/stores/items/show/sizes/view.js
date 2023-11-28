function get_sizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        function add_line(size) {
            let row = tbl_sizes.insertRow(-1);
            addCell(row, {text: size.size1});
            addCell(row, {text: size.size2});
            addCell(row, {text: size.size3});
            addCell(row, {append: new Link(`/sizes/${size.size_id}`).e});
        };
        get({
            table: 'sizes',
            where: {item_id: path[2]},
            like: {
                ...filterSize('size')
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
    addListener('reload', get_sizes);
    addSortListeners('sizes', get_sizes);
    get_sizes();
});