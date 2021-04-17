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
    $('#mdl_gender_view').modal('hide');
    get(
        {
            table: 'gender',
            query: [`gender_id=${gender_id}`]
        },
        function(gender, options) {
            set_attribute({id: 'gender_id_edit', attribute: 'value', value: gender.gender_id});
            set_value({id: 'gender_gender_edit', value: gender._gender});
        }
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'gender_edit',
        'PUT',
        '/genders',
        {
            onComplete: [
                getGenders,
                function () {$('#mdl_gender_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_gender_edit').on('show.bs.modal', function (event) {viewGenderEdit(event.relatedTarget.dataset.id)});
    $('#mdl_gender_view').on('show.bs.modal', function (event) {genderEditBtn(event.relatedTarget.dataset.id)});
});