window.addEventListener('load', function () {
    enable_button('gender_add');
    addFormListener(
        'gender_add',
        'POST',
        '/genders',
        {
            onComplete: [
                getGenders,
                function () {modalHide('gender_add')}
            ]
        }
    );
});