function getItems() {
    clear_table('items')
    .then(tbl_items => {
        let sel_genders = document.querySelector('#sel_genders') || {value: ''};
        get({
            table: 'items',
            query: [sel_genders.value]
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
    })
    .catch(err => console.log(err));
};
document.querySelector('#reload').addEventListener('click', getItems);
