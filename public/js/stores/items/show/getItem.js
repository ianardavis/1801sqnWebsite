function getItem() {
    get(
        function (item, options) {
            set_innerText({id: '_description', text: item._description});
            set_innerText({id: '_size_text',   text: item._size_text});
            set_innerText({id: 'size_text',    text: item._size_text});
            if (item.category) set_innerText({id: '_category',    text: item.category._category});
            if (item.group)    set_innerText({id: '_group',       text: item.group._group});
            if (item.type)     set_innerText({id: '_type',        text: item.type._type});
            if (item.subtype)  set_innerText({id: '_subtype',     text: item.subtype._subtype});
            if (item.gender)   set_innerText({id: '_gender',      text: item.gender._gender});
            set_breadcrumb({text: item._description, href: `/stores/items/${item.item_id}`});
            let item_id_add_size = document.querySelector('#item_id_add_size');
            if (item_id_add_size) item_id_add_size.setAttribute('value', item.item_id);
        },
        {
            table: 'item',
            query: [`item_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getItem);