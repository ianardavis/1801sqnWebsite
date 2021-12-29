let getGenders = listGenders({blank: {text: 'All'}});
function getItems() {
    clear('tbl_items')
    .then(tbl_items => {
        let sel_genders      = document.querySelector('#sel_genders')      || {value: ''},
            item_description = document.querySelector('#item_description') || {value: ''},
            where = null,
            like  = null;
        if (sel_genders.value      !== '') where = {gender_id:   sel_genders.value};
        if (item_description.value !== '') like  = {description: item_description.value};
        get({
            table: 'items',
            where: where,
            like:  like,
            func: getItems
        })
        .then(function ([result, options]) {
            result.items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                add_cell(row, {text: item.description});
                add_cell(row, {append: new Link({href: `/items/${item.item_id}`}).e});
            });
        });
    });
};
addReloadListener(getItems);
sort_listeners(
    'items',
    getItems,
    [
        {value: '["createdAt"]',   text: 'Created'},
        {value: '["description"]', text: 'Description', selected: true}
    ]
);
window.addEventListener('load', function () {
    addListener('sel_genders',      getItems, 'input');
    addListener('item_description', getItems, 'input');
    addListener('reload_genders',   getGenders);
});
