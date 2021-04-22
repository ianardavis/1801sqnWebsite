window.addEventListener( "load", function () {
    addFormListener(
        'item_add',
        'POST',
        '/items',
        {onComplete: getItems}
    );
});