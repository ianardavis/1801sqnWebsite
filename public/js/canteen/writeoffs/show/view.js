function getWriteoff() {
    get({
        table: 'writeoff',
        where: {writeoff_id: path[2]}
    })
    .then(function ([writeoff, options]) {
        setBreadcrumb(`${writeoff.item.name} | ${print_date(writeoff.createdAt, true)}`);
        setInnerText('writeoff_item',      writeoff.item.name);
        setInnerText('writeoff_qty',       writeoff.qty);
        setInnerText('writeoff_cost',      `£${Number(writeoff.cost).toFixed(2)}`);
        setInnerText('writeoff_reason',    writeoff.reason);
        setInnerText('writeoff_createdAt', print_date(writeoff.createdAt, true));
        setInnerText('writeoff_user',      print_user(writeoff.user));
        setHREF('writeoff_user_link', `/users/${writeoff.user_id}`);
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getWriteoff);
});