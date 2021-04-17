function getCategories() {
    clear_table('categories')
    .then(tbl_categories => {
        get({
            table: 'item_categories',
            query: [`item_id=${path[2]}`]
        })
        .then(function ([categories, options]) {
            categories.forEach(category => {
                let row = tbl_categories.insertRow(-1);
                add_cell(row, {text: category.category.category});
                add_cell(row, {classes: ['categories'], data: {field: 'id', value: category.item_category_id}});
            });
            if (typeof categoryDeleteBtns === 'function') categoryDeleteBtns();
        });
    })
    .catch(err => console.log(err));
};