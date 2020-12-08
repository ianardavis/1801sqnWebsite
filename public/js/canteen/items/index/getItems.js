function getItems() {
    get(
        function (items, options) {
            clearElement('tbl_items');
            let tbl_items = document.querySelector('#tbl_items');
            items.forEach(item => {
                if (item.item_id !== 0) {
                    let row = tbl_items.insertRow(-1);
                    add_cell(row, {text: item._name});
                    add_cell(row, {text: `£${Number(item._price).toFixed(2)}`});
                    add_cell(row, {text: item._qty || '0'});
                    if (item._current) add_cell(row, {text: 'Yes'})
                    else add_cell(row, {text: 'No'})
                    add_cell(row, {append: new Link({
                        href: `/canteen/items/${item.item_id}`,
                        small: true
                    }).e});
                };
            });
        },
        {
            db:    'canteen',
            table: 'items',
            query: [document.querySelector('#_current').value || null]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getItems);
document.querySelector('#_current').addEventListener('change', getItems);