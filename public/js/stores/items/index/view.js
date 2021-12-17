function getItems() {
    clear('tbl_items')
    .then(tbl_items => {
        let sel_genders = document.querySelector('#sel_genders') || {value: ''},
            where       = {};
        if (sel_genders.value !== '') where.gender_id = sel_genders.value;
        get({
            table: 'items',
            where: where
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
