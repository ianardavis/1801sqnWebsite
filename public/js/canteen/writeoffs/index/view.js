function getWriteoffs() {
    clear('tbl_writeoffs')
    .then(tbl_writeoffs => {
        get({
            table: 'writeoffs',
            func: getWriteoffs
        })
        .then(function ([results, options]) {
            results.writeoffs.forEach(writeoff => {
                let row = tbl_writeoffs.insertRow(-1);
                add_cell(row, table_date(writeoff.createdAt));
                add_cell(row, {text: writeoff.item.name});
                add_cell(row, {text: writeoff.reason});
                add_cell(row, {text: writeoff.qty});
                add_cell(row, {append: new Link(`/writeoffs/${writeoff.writeoff_id}`).e})});
        });
    });
};
addReloadListener(getWriteoffs);
window.addEventListener('load', function () {
    add_sort_listeners('writeoffs', getWriteoffs);
    getWriteoffs();
});