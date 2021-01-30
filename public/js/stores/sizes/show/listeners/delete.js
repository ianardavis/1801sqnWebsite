window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_delete', attribute: 'disabled'});
    addFormListener(
        'form_delete',
        'DELETE',
        `/stores/sizes/${path[3]}`,
        {redirect: '/stores/items'}
    );
});