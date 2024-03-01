window.addEventListener('load', function () {
    enableButton('user_new_add');
    enableButton('user_existing_add');
    addFormListener(
        'user_new_add',
        'POST',
        `/sites/${path[2]}/users/new`,
        {onComplete: getUsers}
    );
    addFormListener(
        'user_existing_add',
        'POST',
        `/sites/${path[2]}/users/existing`,
        {onComplete: getUsers}
    );
});