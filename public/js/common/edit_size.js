let getSizes = null;
function getSizes_funcs(table, editable_statuses, func, orderable = {orderable: true}) {
    getSizes = function () {
        clear('tbl_sizes')
        .then(tbl_sizes => {
            let where = {};
            where[`${table}_id`] = path[2];
            get({
                table: table,
                where: where
            })
            .then(function ([result, options]) {
                if (editable_statuses.includes(result.status)) {
                    get({
                        table: 'sizes',
                        where: {
                            item_id: result.size.item_id,
                            ...orderable
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
        modalOnShow('size_edit', getSizes);
        addFormListener(
            'size_edit',
            'PUT',
            `/${table}s/${path[2]}/size`,
            {onComplete: [
                func,
                getActions
            ]}
        );
        add_sort_listeners('sizes', getSizes);
    });
};