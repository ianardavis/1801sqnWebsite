function show_sizes() {
    function get_sizes(issue) {
        return new Promise((resolve, reject) => {
            get({
                table: 'sizes',
                where: {
                    item_id: issue.size.item_id,
                    issueable: true
                }
            })
            .then(function ([result, options]) {
                resolve(result.sizes);
            })
            .catch(reject);
        });
    };
    clear('tbl_sizes')
    .then(tbl_sizes => {
        function display_sizes(sizes) {
            sizes.forEach(size => {
                let row = tbl_sizes.insertRow(-1);
                addCell(row, {text: size.size1});
                addCell(row, {text: size.size2});
                addCell(row, {text: size.size3});
                addCell(row, {append: new Radio({
                    attributes: [
                        {field: 'name',  value: 'size_id'},
                        {field: 'value', value: size.size_id}
                    ]
                }).e});
            });
        };
        get({
            table: 'issue',
            where: {issue_id: path[2]}
        })
        .then(check_issue_status)
        .then(get_sizes)
        .then(display_sizes)
        .catch(err => {
            modalHide('size_edit');
            showToast('Error', err.message, true);
            console.error(err);
        });
    });
};
window.addEventListener('load', function () {
    modalOnShow('size_edit', show_sizes);
    enableButton('size_edit');
    addSortListeners('sizes', show_sizes);
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