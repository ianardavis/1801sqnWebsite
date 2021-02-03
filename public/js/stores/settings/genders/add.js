window.addEventListener('load', function () {
    addFormListener(
        'gender_add',
        'POST',
        '/stores/genders',
        {
            onComplete: [
                getGenders,
                loadGendersEdit,
                function () {$('#mdl_gender_add').modal('hide')}
            ]
        }
    );
});