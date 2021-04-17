window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_delete', attribute: 'disabled'});
    addFormListener(
        'item_delete',
        'DELETE',
        `/items/${path[2]}`,
        {redirect: '/items'}
    );
});