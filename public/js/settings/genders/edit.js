function genderEditBtn(gender_id) {
    clear('gender_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Link({
                modal: 'gender_edit',
                type: 'edit',
                data:  {field: 'id', value: gender_id},
                large: true
            }).e
        );

    });
};
function viewGenderEdit(gender_id) {
    modalHide('gender_view');
    get({
        table: 'gender',
        query: [`"gender_id":"${gender_id}"`]
    })
    .then(function([gender, options]) {
        set_attribute('gender_id_edit', 'value', gender.gender_id);
        set_value('gender_gender_edit', gender.gender);
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