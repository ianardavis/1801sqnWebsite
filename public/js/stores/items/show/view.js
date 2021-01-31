function getItem() {
    get(
        function (item, options) {
            set_innerText({id: '_description', text: item._description});
            set_innerText({id: '_size_text',   text: item._size_text});
            set_innerText({id: 'size_text',    text: item._size_text});
            if (item.gender) set_innerText({id: '_gender', text: item.gender._gender});
            else             set_innerText({id: '_gender', text: ''});
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
let categories_loaded = false;
function getCategories() {
    categories_loaded = false;
    get(
        function (categories, options) {
            let tbl_categories = document.querySelector('#tbl_categories');
            if (tbl_categories) {
                tbl_categories.innerHTML = '';
                categories.forEach(category => {
                    let row = tbl_categories.insertRow(-1);
                    add_cell(row, {text: category.category._category});
                    add_cell(row, {classes: ['categories'], data: {field: 'id', value: category.item_category_id}});
                });
                categories_loaded = true;
            };
        },
        {
            table: 'item_categories',
            query: [`item_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getItem);
document.querySelector('#reload').addEventListener('click', getItem);