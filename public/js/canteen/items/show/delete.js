window.addEventListener('load', function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/canteen_items/${path[2]}`,
        {redirect:'/canteen_items'}
    )
});