window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_delete', attribute: 'disabled'});
    addFormListener(
        'delete',
        'DELETE',
        `/stores/items/${path[3]}`,
        {redirect: '/stores/items'}
    );
});