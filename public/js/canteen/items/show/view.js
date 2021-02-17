function getItem() {
    get(
        {
            db: 'canteen',
            table: 'item',
            query: [`item_id=${path[3]}`]
        },
        function (item, options) {
            set_innerText({id: '_name', text: item._name});
            set_innerText({id: '_price', text: `£${item._price}`});
            set_innerText({id: '_cost', text: `£${item._cost}`});
            set_innerText({id: '_qty', text: item._qty});
            set_innerText({id: '_current', text: yesno(item._current)});
            set_breadcrumb({text: item._name});
        }
    )
};
document.querySelector('#reload').addEventListener('click', getItem);