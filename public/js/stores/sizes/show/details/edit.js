function viewDetailEdit(detail_id) {
    get({
        table:   'detail',
        query:   [`detail_id=${detail_id}`],
        spinner: 'detail_edit'
    })
    .then(function ([detail, options]) {
        set_attribute({id: 'detail_id_edit', attribute: 'value', value: detail.detail_id});
        set_value({id: 'detail_name_edit',  value: detail.name});
        set_innerText({id: 'detail_value_edit', text: detail.value});
        $('#mdl_detail_view').modal('hide')
    })
    .catch(err => {
        $('#mdl_detail_edit').modal('hide');
    });
};
function addDetailEditBtn(detail_id) {
    let detail_edit_btn = document.querySelector('#detail_edit_btn');
    if (detail_edit_btn) {
        detail_edit_btn.innerHTML = '';
        get({
            table: 'detail',
            query: [`detail_id=${detail_id}`]
        })
        .then(function ([detail, options]) {
            detail_edit_btn.appendChild(new Button({
                classes: ['float-right'],
                modal:   'detail_edit',
                data:    {field: 'id', value: detail.detail_id},
                type:    'edit',
            }).e);
        });
    };
};
window.addEventListener('load', function() {
    addFormListener(
        'detail_edit',
        'PUT',
        `/detail`,
        {
            onComplete: [
                getDetails,
                function () {$('#mdl_detail_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_detail_view').on('show.bs.modal', function(event) {addDetailEditBtn( event.relatedTarget.dataset.id)});
    $('#mdl_detail_edit').on('show.bs.modal', function(event) {
        viewDetailEdit(event.relatedTarget.dataset.id);
        $(`#mdl_detail_view`).modal('hide');
    });
});