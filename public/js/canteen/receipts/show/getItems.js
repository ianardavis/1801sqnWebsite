function getItems() {
    get(
        {
            db: 'canteen',
            table: 'items',
            query: []
        },
        function (items, options) {
            clearElement('sel_items');
            let sel_items = document.querySelector('#sel_items');
            if (sel_items) {
                sel_items.appendChild(
                    new Option({
                        value: '',
                        text: 'Select item ...',
                        selected: true
                    }).e
                )
                items.forEach(item => {
                    sel_items.appendChild(
                        new Option({
                            value: item.item_id,
                            text: item._name
                        }).e
                    )
                });
            }
        }
    )
}