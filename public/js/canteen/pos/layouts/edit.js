function addEditButtons() {
    document.querySelectorAll('.form_view').forEach(form => {
        form.appendChild(new Button({
            html: '<i class="fas fa-pencil-alt"></i>',
            classes: ['float-end'],
            small: true,
            modal: 'layout_edit',
            data: [
                {field: 'page',     value: form.dataset.page},
                {field: 'position', value: form.dataset.position},
            ]
        }).e)
    })
};
function getButton(page_id, position) {
    get({
        table: 'pos_layout',
        query: [`page_id=${page_id}`, `button=${position}`]
    })
    .then(function ([layout, options]) {
        viewButton(layout)
    })
    .catch(err => {console.log('not found');viewButton()})
};
function viewButton(layout = null) {
    clear_select('items')
    .then(sel_items => {
        get({
            table: 'canteen_items',
            query: ['current=1']
        })
        .then(function ([items, options]) {
            sel_items.appendChild(new Option({text: 'Select Item...', selected: (!layout)}).e)
            items.forEach(item => {
                sel_items.appendChild(new Option({value: item.item_id, text: item.name, selected: (layout && layout.item_id === item.item_id ? true : false)}).e)
            });
            set_value({id: 'colour_edit', value: (layout ? `#${layout.colour}` : '#31639e')})
        });
    })
}
window.addEventListener('load', function () {
    modalOnShow('layout_edit', function (event) {getButton(event.relatedTarget.dataset.page, event.relatedTarget.dataset.position)})
});