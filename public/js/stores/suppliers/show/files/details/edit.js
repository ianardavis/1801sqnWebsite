function viewDetailEdit(file_detail_id) {
    modalHide('file_view');
    get({
        table:   'file_detail',
        where:   {file_detail_id: file_detail_id},
        spinner: 'file_detail_edit'
    })
    .then(function ([detail, options]) {
        setAttribute('file_detail_id_edit', 'value', detail.file_detail_id);
        setValue('file_detail_name_edit',  detail.name);
        setValue('file_detail_value_edit', detail.value);
    });
};
function addDetailEditBtns() {
    document.querySelectorAll('.file_details_edit').forEach(e => {
        get({
            table: 'file_detail',
            where: {file_detail_id: e.dataset.id}
        })
        .then(function ([detail, options]) {
            e.appendChild(
                new Modal_Button(
                    _edit(),
                    'file_detail_edit',
                    [{field: 'id', value: detail.file_detail_id}]
                ).e
            );
        });
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'file_detail_edit',
        'PUT',
        '/file_details',
        {onComplete: function () {modalHide('file_detail_edit')}}
    );
    modalOnShow('file_detail_edit', function (event) {viewDetailEdit(event.relatedTarget.dataset.id)});
});