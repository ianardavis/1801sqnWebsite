const get_genders = listGenders();
function get_items() {
    Promise.all([
        clear('tbl_items'),
        filterGender('item')
    ])
    
    .then(([tbl_items, filterGenders]) => {
        function add_line(item) {
            let row = tbl_items.insertRow(-1);
            addCell(row, {text: item.description});
            addCell(row, {append: new Link(`/items/${item.item_id}`).e});
        };
        get({
            table: 'items',
            where: {
                ...filterGenders
            },
            like: {
                ...filterItem('item')
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
    addListener('reload', get_items);
    addListener('sel_genders',      get_items, 'input');
    addListener('item_description', get_items, 'input');
    addListener('reload_genders',   get_genders);
    addSortListeners('items', get_items);
    get_items();
});