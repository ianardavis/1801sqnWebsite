function getItem() {
    get(
        {
            table: 'item',
            query: [`item_id=${path[2]}`]
        },
        function (item, options) {
            set_innerText({id: 'description', text: item.description});
            set_innerText({id: 'size_text',   text: item.size_text});
            if (item.gender) set_innerText({id: 'gender', text: item.gender.gender});
            else             set_innerText({id: 'gender', text: ''});
            set_breadcrumb({text: item._description, href: `/items/${item.item_id}`});
            set_attribute({id: 'item_id_add_size', attribute: 'value', value: item.item_id});
            set_attribute({id: 'item_id_category', attribute: 'value', value: item.item_id});
        }
    );
};
window.addEventListener('load', function () {
    document.querySelector('#reload').addEventListener('click', getItem);
    document.querySelector('#reload').addEventListener('click', getItem);
});