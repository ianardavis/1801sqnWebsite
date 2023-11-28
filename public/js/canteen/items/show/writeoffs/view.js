function getWriteoffs() {
    clear('tbl_writeoffs')
    .then(tbl_writeoffs => {
        get({
            table: 'writeoffs',
            where: {item_id: path[2]},
            func: getWriteoffs
        })
        .then(function ([result, options]) {
            setCount('writeoff', result.count);
            result.writeoffs.forEach(writeoff => {
                try {
                    let row = tbl_writeoffs.insertRow(-1);
                    addCell(row, tableDate(writeoff.createdAt));
                    addCell(row, {text: writeoff.reason});
                    addCell(row, {text: writeoff.qty});
                    addCell(row, {append: new Link(`/writeoffs/${writeoff.writeoff_id}`).e});
                } catch (error) {
                    console.error(`canteen/items/show/writeoffs/view.js | getWriteoffs | ${error}`);
                };
            });
        });
    })
};
window.addEventListener('load', function () {
    addListener('reload', getWriteoffs);
    addSortListeners('writeoffs', getWriteoffs);
    getWriteoffs();
});