function getSizes() {
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
                        item_id: issue.size.item_id,
                        orderable: true
                    }
                })
                .then(function ([result, options]) {
                    result.sizes.forEach(size => {
                        let row = tbl_sizes.insertRow(-1);
                        add_cell(row, {text: size.size1});
                        add_cell(row, {text: size.size2});
                        add_cell(row, {text: size.size3});
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
};
function getQty() {
    get({
        table: 'issue',
        where: {issue_id: path[2]}
    })
    .then(function ([issue, options]) {
        set_value('inp_issue_qty_edit', issue.qty)
    })
    .catch(err => console.log(err));
};
sort_listeners(
    'sizes',
    getSizes,
    [
        {value: '["createdAt"]', text: 'Created'},
        {value: '["size1"]',     text: 'Size 1', selected: true},
        {value: '["size2"]',     text: 'Size 2'},
        {value: '["size3"]',     text: 'Size 3'}
    ],
    false
);
window.addEventListener('load', function () {
    modalOnShow('qty_edit', getQty);
    modalOnShow('size_edit', getSizes);
    addFormListener(
        'qty_edit',
        'PUT',
        `/issues/${path[2]}/qty`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
    addFormListener(
        'size_edit',
        'PUT',
        `/issues/${path[2]}/size`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
});