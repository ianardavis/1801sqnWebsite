function getWriteoff() {
    get({
        table: 'writeoff',
        where: {writeoff_id: path[2]}
    })
    .then(function ([writeoff, options]) {
        setBreadcrumb(`${writeoff.item.name} | ${printDate(writeoff.createdAt, true)}`);
        setInnerText('writeoff_item',      writeoff.item.name);
        setInnerText('writeoff_qty',       writeoff.qty);
        setInnerText('writeoff_cost',      `£${Number(writeoff.cost).toFixed(2)}`);
        setInnerText('writeoff_reason',    writeoff.reason);
        setInnerText('writeoff_createdAt', printDate(writeoff.createdAt, true));
        setInnerText('writeoff_user',      printUser(writeoff.user));
        setHREF('writeoff_user_link', `/users/${writeoff.user_id}`);
    });
};
window.addEventListener('load', function () {
    addListener('reload', getWriteoff);
});