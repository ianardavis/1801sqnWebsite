window.addEventListener( "load", function () {
    enableButton('item_add');
    modalOnShow('item_add', get_size_descriptions);
    addFormListener(
        'item_add',
        'POST',
        '/items',
        {onComplete: getItems}
    );
});