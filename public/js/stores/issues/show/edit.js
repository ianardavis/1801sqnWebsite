function enable_edit(issue) {
    if (issue.status >= 0 && issue.status <= 5) {
        for (let i=0; i<=5 ; i++) {
            if (issue.status !== i) enable_button(`mark_${i}`);
        };
        enable_button('mark_as');
    };
    if (issue.status === 1 || issue.status === 2) {
        enable_button('size_edit');
        enable_button('qty_edit');
        set_data('btn_size_edit', 'item_id', issue.size.item_id);
    };
};
function get_qty() {
    get({
        table: 'issue',
        where: {issue_id: path[2]}
    })
    .then(function ([issue, options]) {
        if (issue.status === 1 || issue.status === 2) {
            set_value('issue_qty_edit', issue.qty);
        } else {
            modalHide('qty_edit');
            alert_toast('Not an editable status');
        };
    })
    .catch(err => console.log(err));
};
function get_sizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'issue',
            where: {issue_id: path[2]}
        })
        .then(function ([result, options]) {
            console.log(result);
            if (result.status === 1 || result.status === 2) {
                get({
                    table: 'sizes',
                    where: {
                        item_id: result.size.item_id,
                        issueable: true
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
                                {field: 'name',  value: 'size_id'},
                                {field: 'value', value: size.size_id}
                            ]
                        }).e});
                    });
                })
                .catch(err => console.log(err));
            } else {
                modalHide('size_edit');
                alert_toast('Not an editable status');
            };
        })
        .catch(err => console.log(err));
    });
};
window.addEventListener('load', function () {
    modalOnShow('qty_edit',  get_qty);
    modalOnShow('size_edit', get_sizes);
    
    addFormListener(
        'mark_as',
        'PUT',
        `/issues/${path[2]}/mark`,
        {
            onComplete: [
                getIssue,
                getActions
            ]
        }
    );
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
    add_sort_listeners('sizes', get_sizes);
});