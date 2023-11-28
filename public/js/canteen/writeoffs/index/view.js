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
                addCell(row, tableDate(writeoff.createdAt));
                addCell(row, {text: writeoff.item.name});
                addCell(row, {text: writeoff.reason});
                addCell(row, {text: writeoff.qty});
                addCell(row, {append: new Link(`/writeoffs/${writeoff.writeoff_id}`).e})});
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getWriteoffs);
    addSortListeners('writeoffs', getWriteoffs);
    getWriteoffs();
});