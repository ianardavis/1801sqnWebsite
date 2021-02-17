function listCategories(options = {}) {
    get(
        {
            table: 'categories',
            ...options
        },
        function (categories, options) {
            let select = document.querySelector(`#${options.select || 'sel_category'}`);
            if (select) {
                select.innerHTML = '';
                select.appendChild(new Option({text: '---None---', selected: (options.selected === '')}).e);
                categories.forEach(category => {
                    select.appendChild(
                        new Option({
                            text:     `${category._category} (${category.category_id})`,
                            value:    category.category_id,
                            selected: (options.selected === category.category_id)
                        }).e
                    );
                });
            };
        }
    );
};