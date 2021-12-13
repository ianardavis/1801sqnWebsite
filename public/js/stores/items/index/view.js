function getItems() {
    clear('tbl_items')
    .then(tbl_items => {
        let sel_genders = document.querySelector('#sel_genders')      || {value: ''},
            query       = [];
        if (sel_genders.value !== '') query.push(sel_genders.value);
        get({
            table: 'items',
            query: query,
            ...sort_query(tbl_items)
        })
        .then(function ([items, options]) {
            items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                add_cell(row, {
                    text: item.description,
                    classes: ['search']
                });
                add_cell(row, {append: new Link({href: `/items/${item.item_id}`}).e});
            });
        });
    });
};
addReloadListener(getItems);
