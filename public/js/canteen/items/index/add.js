window.addEventListener('load', function () {
    addFormListener(
        'item_add',
        'POST',
        '/canteen_items',
        {onComplete: [
            getItems,
            function () {modalHide('item_add')}
        ]}
    )
})