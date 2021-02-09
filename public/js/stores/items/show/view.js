function getItem() {
    get(
        {
            table: 'item',
            query: [`item_id=${path[3]}`]
        },
        function (item, options) {
            set_innerText({id: '_description', text: item._description});
            set_innerText({id: '_size_text',   text: item._size_text});
            set_innerText({id: 'size_text',    text: item._size_text});
            if (item.gender) set_innerText({id: '_gender', text: item.gender._gender});
            else             set_innerText({id: '_gender', text: ''});
            set_breadcrumb({text: item._description, href: `/stores/items/${item.item_id}`});
            set_attribute({id: 'item_id_add_size', attribute: 'value', value: item.item_id});
            set_attribute({id: 'item_id_category', attribute: 'value', value: item.item_id});
        }
    );
};
window.addEventListener('load', function () {
    document.querySelector('#reload').addEventListener('click', getItem);
    document.querySelector('#reload').addEventListener('click', getItem);
});