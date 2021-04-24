window.addEventListener('load', function () {
    enable_button('gender_add');
    addFormListener(
        'gender_add',
        'POST',
        '/genders',
        {
            onComplete: [
                getGenders,
                function () {$('#mdl_gender_add').modal('hide')}
            ]
        }
    );
});