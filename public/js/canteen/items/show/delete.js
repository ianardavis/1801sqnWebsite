window.addEventListener('load', function () {
    remove_attribute({id: 'btn_delete', attribute: 'disabled'});
    addFormListener(
        'delete',
        'DELETE',
        `/canteen/items/${path[2]}`,
        {redirect:'/canteen/items'}
    )
});