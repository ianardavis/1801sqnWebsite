window.addEventListener('load', function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/canteen_items/${path[2]}`,
        {redirect:'/cant_en/items'}
    )
});