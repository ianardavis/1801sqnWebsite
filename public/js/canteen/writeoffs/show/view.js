function getWriteoff() {
    get({
        table: 'writeoff',
        query: [`writeoff_id=${path[2]}`]
    })
    .then(function ([writeoff, options]) {
        set_breadcrumb({text: writeoff.writeoff_id});
        set_innerText({id: 'writeoff_item', value: writeoff.item.name});
        set_innerText({id: 'writeoff_qty',  value: writeoff.qty});
        set_innerText({id: 'writeoff_cost', value: `£${Number(writeoff.cost).toFixed(2)}`});
        set_innerText({id: 'writeoff_reason', value: writeoff.reason});
        set_innerText({id: 'writeoff_createdAt', value: print_date(writeoff.createdAt, true)});
        set_innerText({id: 'writeoff_user',  value: print_user(writeoff.user)});
        set_href({id: 'writeoff_user_link', value: `/users/${writeoff.user_id}`});
    });
};
addReloadListener(getWriteoff);