window.addEventListener('load', function () {
    enableButton('gender_add');
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