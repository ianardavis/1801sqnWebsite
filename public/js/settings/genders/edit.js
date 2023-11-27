function genderEditBtn(gender_id) {
    clear('gender_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Modal_Button(
                _edit(),
                'gender_edit',
                [{field: 'id', value: gender_id}],
                false
            ).e
        );

    });
};
function viewGenderEdit(gender_id) {
    modalHide('gender_view');
    get({
        table: 'gender',
        where: {gender_id: gender_id}
    })
    .then(function([gender, options]) {
        set_attribute('gender_id_edit', 'value', gender.gender_id);
        setValue('gender_gender_edit', gender.gender);
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'gender_edit',
        'PUT',
        '/genders',
        {
            onComplete: [
                getGenders,
                function () {modalHide('gender_edit')}
            ]
        }
    );
    modalOnShow('gender_edit', function (event) {viewGenderEdit(event.relatedTarget.dataset.id)});
    modalOnShow('gender_view', function (event) {genderEditBtn(event.relatedTarget.dataset.id)});
});