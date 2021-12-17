function addEditButtons() {
    document.querySelectorAll('.edit_dd').forEach(span => {
        span.appendChild(new Button({
            small: true,
            type: 'edit',
            modal: 'layout_edit',
            html: '<i class="fas fa-pencil-alt"></i>',
            data: [
                {field: 'page',     value: span.dataset.page},
                {field: 'position', value: span.dataset.position},
            ]
        }).e);
    });
};
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
        .then(function ([items, options]) {
            sel_items.appendChild(new Option({text: 'Select Item...', selected: (!layout)}).e);
            items.forEach(e => sel_items.appendChild(new Option({
                value: e.item_id,
                text:  e.name,
                selected: (layout && layout.item_id === e.item_id ? true : false)
            }).e));
            set_value('layout_button_edit', position);
            set_value('layout_page_edit',   page_id);
            set_value('colour_edit',        (layout ? `${layout.colour}` : '#31639e'));
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
                                path: `/pos_layouts/${layout.pos_layout_id}`,
                                descriptor: 'layout',
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
    )
});