function getItems() {
    clear('tbl_items')
    .then(tbl_items => {
        let sel_genders = document.querySelector('#sel_genders')      || {value: ''},
            sort_cols   = tbl_items.parentNode.querySelector('.sort') || null,
            query       = [];
        if (sel_genders.value !== '') query.push(sel_genders.value);
        get({
            table: 'items',
            query: query,
            ...sort_query(sort_cols)
        })
        .then(function ([items, options]) {
            items.forEach(item => {
                let row = tbl_items.insertRow(-1);
                add_cell(row, {
                    text: item.description,
                    classes: ['search']
                });
                add_cell(row, {append: new Link({
                    href: `/items/${item.item_id}`,
                    small: true
                }).e});
            });
        });
    });
};
addReloadListener(getItems);
