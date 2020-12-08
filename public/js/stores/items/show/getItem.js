function getItem() {
    get(
        function (item, options) {
            ['description', 'size_text'].forEach(e => {
                try {
                    document.querySelector(`#_${e}`).innerText = item[`_${e}`];
                } catch (error) {console.log(error)};
            });
            ['category', 'group', 'type', 'subtype', 'gender'].forEach(e => {
                try {
                    let _element = document.querySelector(`#_${e}`);
                    if (item[e]) {_element.innerText = item[e][`_${e}`]};
                } catch (error) {console.log(error)};
            });
            set_breadcrumb({text: item._description, href: `/stores/items/${item.item_id}`});
            let btn_add_size = document.querySelector('#btn_add_size'),
                item_id_add_size = document.querySelector('#item_id_add_size');
            if (item_id_add_size) item_id_add_size.setAttribute('value', item.item_id);
            if (btn_add_size) btn_add_size.addEventListener('click', function () {$("#mdl_add_size").modal("show")});
        },
        {
            table: 'item',
            query: [`item_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getItem);