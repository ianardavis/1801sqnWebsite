const get_genders = listGenders();
function get_items() {
    clear('tbl_items')
    .then(tbl_items => {
        function add_line(item) {
            let row = tbl_items.insertRow(-1);
            add_cell(row, {text: item.description});
            add_cell(row, {append: new Link(`/items/${item.item_id}`).e});
        };
        get({
            table: 'items',
            where: {
                ...filter_gender('item')
            },
            like: {
                ...filter_item('item')
            },
            func: get_items
        })
        .then(function ([result, options]) {
            result.items.forEach(item => {
                add_line(item);
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', get_items);
    add_listener('sel_genders',      get_items, 'input');
    add_listener('item_description', get_items, 'input');
    add_listener('reload_genders',   get_genders);
    add_sort_listeners('items', get_items);
    get_items();
});