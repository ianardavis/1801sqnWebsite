function genderEditBtn(gender_id) {
    let span_edit = document.querySelector('#gender_edit');
    if (span_edit) {
        span_edit.innerHTML = '';
        span_edit.appendChild(
            new Link({
                modal: 'gender_edit',
                type: 'edit',
                data:  {field: 'id', value: gender_id}
            }).e
        );
    };
};
function viewGenderEdit(gender_id) {
    modalHide('gender_view');
    get({
        table: 'gender',
        query: [`gender_id=${gender_id}`]
    })
    .then(function([gender, options]) {
        set_attribute({id: 'gender_id_edit', attribute: 'value', value: gender.gender_id});
        set_value({id: 'gender_gender_edit', value: gender._gender});
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