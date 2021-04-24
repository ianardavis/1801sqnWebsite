window.addEventListener('load', function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/canteen/items/${path[2]}`,
        {redirect:'/canteen/items'}
    )
});