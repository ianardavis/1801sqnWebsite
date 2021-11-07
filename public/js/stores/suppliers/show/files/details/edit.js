function viewDetailEdit(file_detail_id) {
    modalHide('file_view');
    get({
        table:   'file_detail',
        query:   [`"file_detail_id":"${file_detail_id}"`],
        spinner: 'file_detail_edit'
    })
    .then(function ([detail, options]) {
        set_attribute({id: 'file_detail_id_edit',    attribute: 'value', value: detail.file_detail_id});
        set_value(    {id: 'file_detail_name_edit',  value: detail.name});
        set_value(    {id: 'file_detail_value_edit', value: detail.value});
    });
};
function addDetailEditBtns() {
    document.querySelectorAll('.file_details_edit').forEach(e => {
        get({
            table: 'file_detail',
            query: [`"file_detail_id":"${e.dataset.id}"`]
        })
        .then(function ([detail, options]) {
            e.appendChild(
                new Link({
                    modal: 'file_detail_edit',
                    data:  {field: 'id', value: detail.file_detail_id},
                    small: true,
                    type:  'edit'
                }).e
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