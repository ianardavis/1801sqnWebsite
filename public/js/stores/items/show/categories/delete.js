function categoryDeleteBtns() {
    document.querySelectorAll('.categories').forEach(e => {
        get(
            {
                table: 'item_category',
                query: [`item_category_id=${e.dataset.id}`]
            },
            function(item_category, options) {
                e.appendChild(
                    new Delete_Button({
                        descriptor: 'category',
                        path:       `/item_categories/${item_category.item_category_id}`,
                        small:      true,
                        options:    {onComplete: getCategories}
                    }).e
                );
                e.removeAttribute('data-id');
                e.removeAttribute('class');
            }
        );
    });
};