function set_mark_as_options(status) {
    if (status >= 0 && status <= 5) {
        for (let i=0; i<=5 ; i++) {
            if (status !== i) enableButton(`mark_${i}`);
        };
        enableButton('mark_as');
    };
};
function get_qty() {
    get({
        table: 'order',
        where: {order_id: path[2]}
    })
    .then(function ([order, options]) {
        if (order.status === 1) {
            setValue('inp_qty_edit', order.qty);
        } else {
            modalHide('qty_edit');
            showToast('Error', 'Not an editable status', true);
        };
    })
    .catch(err => console.error(err));
};
function get_sizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        get({
            table: 'order',
            where: {order_id: path[2]}
        })
        .then(function ([result, options]) {
            if (result.status === 1) {
                get({
                    table: 'sizes',
                    where: {
                        item_id: result.size.item_id,
                        orderable: true
                    }
                })
                .then(function ([result, options]) {
                    result.sizes.forEach(size => {
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
                })
                .catch(err => console.error(err));
            } else {
                modalHide('size_edit');
                showToast('Error', 'Not an editable status', true);
            };
        })
        .catch(err => console.error(err));
    });
};
window.addEventListener('load', function () {
    modalOnShow('size_edit', get_sizes);
    modalOnShow('qty_edit',  get_qty);
    enableButton('size_edit');
    enableButton('qty_edit');
    addSortListeners('sizes', get_sizes);

    addFormListener(
        'mark_as',
        'PUT',
        `/orders/${path[2]}/mark`,
        {
            onComplete: [
                getOrder,
                getActions
            ]
        }
    );
    addFormListener(
        'size_edit',
        'PUT',
        `/orders/${path[2]}/size`,
        {onComplete: [
            getOrder,
            getActions
        ]}
    );
    addFormListener(
        'qty_edit',
        'PUT',
        `/orders/${path[2]}/qty`,
        {onComplete: [
            getOrder,
            getActions
        ]}
    );
});