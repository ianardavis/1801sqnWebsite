window.addEventListener( "load", function () {
    modalOnShow('item_add', get_size_descriptions);
    addFormListener(
        'item_add',
        'POST',
        '/items',
        {onComplete: getItems}
    );
});