function listCategories(options = {}) {
    return new Promise((resolve, reject) => {
        clear(options.select || 'sel_category')
        .then(sel_category => {
            get({
                table: 'categories',
                ...options
            })
            .then(function ([categories, options]) {
                sel_category.appendChild(new Option({text: '---None---', selected: (options.selected === '')}).e);
                categories.forEach(category => {
                    sel_category.appendChild(
                        new Option({
                            text:     `${category.category} (${category.category_id})`,
                            value:    category.category_id,
                            selected: (options.selected === category.category_id)
                        }).e
                    );
                });
				resolve(true);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};