function set_mark_as_options(status) {
    if (status >= 0 && status <= 5) {
        for (let i=0; i<=5 ; i++) {
            if (status !== i) enable_button(`mark_${i}`);
        };
        enable_button('mark_as');
    };
};
function get_qty() {
    get({
        table: 'issue',
        where: {issue_id: path[2]}
    })
    .then(function ([issue, options]) {
        if (issue.status === 1 || issue.status === 2) {
            set_value('inp_qty_edit', issue.qty);
        } else {
            modalHide('qty_edit');
            alert_toast('Not an editable status');
        };
    })
    .catch(err => console.error(err));
};
function get_sizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'issue',
            where: {issue_id: path[2]}
        })
        .then(function ([result, options]) {
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
                .catch(err => console.error(err));
            } else {
                modalHide('size_edit');
                alert_toast('Not an editable status');
            };
        })
        .catch(err => console.error(err));
    });
};
window.addEventListener('load', function () {
    modalOnShow('size_edit', get_sizes);
    modalOnShow('qty_edit',  get_qty);
    enable_button('size_edit');
    enable_button('qty_edit');
    add_sort_listeners('sizes', get_sizes);
    
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
        'size_edit',
        'PUT',
        `/issues/${path[2]}/size`,
        {onComplete: [
            getIssue,
            getActions
        ]}
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
});