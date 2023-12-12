function genderDeleteBtn(event) {
    setAttribute('gender_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enablebutton('genderDelete');
    addFormListener(
        'gender_delete',
        'DELETE',
        '/genders',
        {
            onComplete: [
                getGenders,
                function () {modalHide('gender_view')}
            ]
        }
    );
    modalOnShow('gender_view', genderDeleteBtn);
});