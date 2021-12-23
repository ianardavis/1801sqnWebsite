function getSizes(event) {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'issue',
            where: {issue_id: path[2]}
        })
        .then(function ([issue, options]) {
            if (issue.status === 1 || issue.status === 2) {
                get({
                    table: 'sizes',
                    where:{
                        item_id: event.relatedTarget.dataset.item_id,
                        orderable: true
                    }
                })
                .then(function ([sizes, options]) {
                    sizes.forEach(size => {
                        let row = tbl_sizes.insertRow(-1);
                        add_cell(row, {text: print_size(size)});
                        add_cell(row, {append: new Radio({
                            attributes: [
                                {field: 'name', value: 'size_id'},
                                {field: 'value', value: size.size_id}
                            ]
                        }).e});
                    });
                })
                .catch(err => console.log(err));
            };
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