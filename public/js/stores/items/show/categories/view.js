function getCategories() {
    let tbl_categories = document.querySelector('#tbl_categories');
    if (tbl_categories) {
        tbl_categories.innerHTML = '';
        get(
            {
                table: 'item_categories',
                query: [`item_id=${path[3]}`]
            },
            function (categories, options) {
                categories.forEach(category => {
                    let row = tbl_categories.insertRow(-1);
                    add_cell(row, {text: category.category._category});
                    add_cell(row, {classes: ['categories'], data: {field: 'id', value: category.item_category_id}});
                });
                if (typeof categoryDeleteBtns) categoryDeleteBtns();
            }
        );
    };
};