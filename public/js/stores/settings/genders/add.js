window.addEventListener('load', function () {
    remove_attribute({id: 'btn_gender_add', attribute: 'disabled'});
    addFormListener(
        'gender_add',
        'POST',
        '/stores/genders',
        {
            onComplete: [
                getGenders,
                function () {$('#mdl_gender_add').modal('hide')}
            ]
        }
    );
});