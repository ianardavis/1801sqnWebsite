function getSizes(event) {
    console.log(event.relatedTarget.dataset.item_id);
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'sizes',
            query: [`"item_id":"${event.relatedTarget.dataset.item_id}"`,'"orderable":"1"']
        })
        .then(function ([sizes, options]) {
            sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                add_cell(row, {text: print_size(size)});
                add_cell(row, {append: new Radio({
                    small: true,
                    attributes: [
                        {field: 'name', value: 'size_id'},
                        {field: 'value', value: size.size_id}
                    ]
                }).e});
            });
        })
        .catch(err => console.log(err));
    });
}
window.addEventListener('load', function () {
    modalOnShow('size_edit', getSizes);
    addFormListener(
        'size_edit',
        'PUT',
        `/issues/${path[2]}/size`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    )
});