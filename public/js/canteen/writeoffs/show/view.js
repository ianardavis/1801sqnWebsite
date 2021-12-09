function getWriteoff() {
    get({
        table: 'writeoff',
        query: [`"writeoff_id":"${path[2]}"`]
    })
    .then(function ([writeoff, options]) {
        set_breadcrumb(`${writeoff.item.name} | ${print_date(writeoff.createdAt, true)}`);
        set_innerText('writeoff_item',      writeoff.item.name);
        set_innerText('writeoff_qty',       writeoff.qty);
        set_innerText('writeoff_cost',      `£${Number(writeoff.cost).toFixed(2)}`);
        set_innerText('writeoff_reason',    writeoff.reason);
        set_innerText('writeoff_createdAt', print_date(writeoff.createdAt, true));
        set_innerText('writeoff_user',      print_user(writeoff.user));
        set_href('writeoff_user_link', `/users/${writeoff.user_id}`);
    });
};
addReloadListener(getWriteoff);