let getQty = null;
function getQty_funcs(table, editable_statuses, func) {
    let where = {};
    where[`${table}_id`] = path[2];
    getQty = function () {
        get({
            table: table,
            where: where
        })
        .then(function ([result, options]) {
            if (editable_statuses.includes(result.status)) {
                set_value('inp_qty_edit', result.qty);
            } else {
                modalHide('qty_edit');
                alert_toast('Not an editable status');
            };
        })
        .catch(err => console.log(err));
    };
    window.addEventListener('load', function () {
        modalOnShow('qty_edit', getQty);
        addFormListener(
            'qty_edit',
            'PUT',
            `/${table}s/${path[2]}/qty`,
            {onComplete: [
                func,
                getActions
            ]}
        );
    });
};