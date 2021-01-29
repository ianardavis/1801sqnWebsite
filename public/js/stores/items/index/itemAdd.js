window.addEventListener( "load", () => {
    addFormListener(
        'form_item_add',
        'POST',
        '/stores/items',
        {onComplete: getItems}
    );
});