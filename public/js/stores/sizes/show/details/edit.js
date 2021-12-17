function viewDetailEdit(detail_id) {
    get({
        table:   'detail',
        where: {detail_id: detail_id},
        spinner: 'detail_edit'
    })
    .then(function ([detail, options]) {
        set_attribute('detail_id_edit', 'value', detail.detail_id);
        set_value('detail_name_edit', detail.name);
        set_innerText('detail_value_edit', detail.value);
    })
    .catch(err => {
        modalHide('detail_edit');
    });
};
function addDetailEditBtn(detail_id) {
    clear('detail_edit_btn')
    .then(detail_edit_btn => {
        get({
            table: 'detail',
            where: {detail_id: detail_id},
        })
        .then(function ([detail, options]) {
            detail_edit_btn.appendChild(new Button({
                classes: ['float-end'],
                modal:   'detail_edit',
                data:    [
                    {field: 'id', value: detail.detail_id},
                    {field: 'bs-dismiss', value: 'modal'}
                ],
                type: 'edit',
            }).e);
        });
    });
};
window.addEventListener('load', function() {
    addFormListener(
        'detail_edit',
        'PUT',
        `/detail`,
        {
            onComplete: [
                getDetails,
                function () {modalHide('detail_edit')}
            ]
        }
    );
    modalOnShow('detail_view', function(event) {addDetailEditBtn( event.relatedTarget.dataset.id)});
    modalOnShow('detail_edit', function(event) {viewDetailEdit(event.relatedTarget.dataset.id);});
});