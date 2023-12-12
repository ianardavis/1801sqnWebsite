let editMode = false;
function addEditButtons() {
    console.log('add edit buttons');
    document.querySelectorAll('.edit_dd').forEach(span => {
        span.appendChild(new Modal_Button(
            _edit(),
            'layout_edit',
            [
                {field: 'page',     value: span.dataset.page},
                {field: 'position', value: span.dataset.position},
            ]
        ).e);
    });
};
function removeEditButtons() {
    document.querySelectorAll('.edit_dd').forEach(e => e.innerHTML = '');
};
function toggleEditMode() {
    editMode = !editMode;
    if (editMode)
    {
        addEditButtons();
    } else {
        removeEditButtons();
    }
    
}
function getButton(page_id, position) {
    get({
        table: 'pos_layout',
        where: {
            page_id: page_id,
            button:  position
        }
    })
    .then(([layout, options]) => viewButton(page_id, position, layout))
    .catch(err => viewButton(page_id, position))
};
function viewButton(page_id, position, layout = null) {
    clear('sel_items')
    .then(sel_items => {
        get({
            table: 'canteen_items',
            where: {current: true}
        })
        .then(function ([results, options]) {
            sel_items.appendChild(new Option({text: 'Select Item...', selected: (!layout)}).e);
            results.items.forEach(e => sel_items.appendChild(new Option({
                value: e.item_id,
                text:  e.name,
                selected: (layout && layout.item_id === e.item_id ? true : false)
            }).e));
            setValue('layout_button_edit', position);
            setValue('layout_page_edit',   page_id);
            setValue('colour_edit',        (layout ? `${layout.colour}` : '#31639e'));
            clear('layout_delete_btn')
            .then(layout_delete_btn => {
                get({
                    table: 'pos_layout',
                    where: {
                        page_id: page_id,
                        button:  position
                    }
                })
                .then(function ([layout, options]) {
                    if (layout) {
                        layout_delete_btn.appendChild(
                            new Delete_Button({
                                descriptor: 'layout',
                                path: `/pos_layouts/${layout.pos_layout_id}`,
                                options: {
                                    onComplete: [
                                        getPages,
                                        function () {modalHide('layout_edit')}
                                    ]
                                }
                            }).e
                        );
                    };
                });
            });
        });
    })
}
window.addEventListener('load', function () {
    modalOnShow('layout_edit', function (event) {getButton(event.relatedTarget.dataset.page, event.relatedTarget.dataset.position)})
    addFormListener(
        'layout_edit',
        'PUT',
        '/pos_layouts',
        {onComplete: getPages}
    );
    document.querySelector('#btnEditMode').addEventListener('click', toggleEditMode);
    document.querySelector('#btnEditMode').removeAttribute('disabled');
});