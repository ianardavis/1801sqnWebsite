function getItems() {
    let sel_genders = document.querySelector('#sel_genders') || {value: ''},
        tbl_items   = document.querySelector('#tbl_items');
    if (tbl_items) {
        tbl_items.innerHTML = '';
        get(
            {
                table: 'items',
                query: [sel_genders.value]
            },
            function (items, options) {
                items.forEach(item => {
                    let row = tbl_items.insertRow(-1);
                    add_cell(row, {
                        text: item._description,
                        classes: ['search']
                    });
                    add_cell(row, {append: new Link({
                        href: `/stores/items/${item.item_id}`,
                        small: true
                    }).e});
                });
            }
        );
    };
};
if (typeof listGenders === 'function') {
    document.querySelector('#reload_genders').addEventListener('click',  function () {
        listGenders({
            onComplete: getItems,
            blank_text: 'All',
            select: 	'sel_genders',
            blank: 		true
        });
    });
};
document.querySelector('#reload')     .addEventListener('click',  getItems);
document.querySelector('#sel_genders').addEventListener('change', getItems);