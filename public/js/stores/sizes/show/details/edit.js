function viewDetailEdit(detail_id) {
    get({
        table:   'detail',
        where: {detail_id: detail_id},
        spinner: 'detail_edit'
    })
    .then(function ([detail, options]) {
        set_attribute('detail_id_edit', 'value', detail.detail_id);
        setValue('detail_name_edit', detail.name);
        setInnerText('detail_value_edit', detail.value);
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
            detail_edit_btn.appendChild(new Modal_Button(
                _search(),
                'detail_edit',
                [
                    {field: 'id', value: detail.detail_id},
                    {field: 'bs-dismiss', value: 'modal'}
                ],
                false,
                {classes: ['float-end']}
            ).e);
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
                get_details,
                function () {modalHide('detail_edit')}
            ]
        }
    );
    modalOnShow('detail_view', function(event) {addDetailEditBtn(event.relatedTarget.dataset.id)});
    modalOnShow('detail_edit', function(event) {viewDetailEdit(event.relatedTarget.dataset.id);});
});