function getItem() {
    get(
        {
            db: 'canteen',
            table: 'item',
            query: [`item_id=${path[3]}`]
        },
        function (item, options) {
            for (let [id, value] of Object.entries(item)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === '_current') {
                        if (element) element.innerText = yesno(value);
                    } else if (element) element.innerText = value;
                    if (['_price', '_name', '_cost', '_current'].includes(id)) {
                        let edit_field = document.querySelector(`#edit${id}`);
                        if (edit_field) edit_field.value = value;
                    };
                } catch (error) {console.log(error)};
            };
            set_breadcrumb({text: item._name, href: `/canteen/items/${item.item_id}`});
        }
    )
};
document.querySelector('#reload').addEventListener('click', getItem);