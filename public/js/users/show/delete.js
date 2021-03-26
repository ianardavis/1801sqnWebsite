window.addEventListener('load', function () {
    remove_attribute({id: 'btn_user_delete', attribute: 'disabled'});
    addFormListener(
        'user_delete',
        'DELETE',
        `/users/${path[2]}`,
        {redirect: '/users'}
    );
});