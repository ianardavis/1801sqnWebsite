function getWriteoffs() {
    clear('tbl_writeoffs')
    .then(tbl_writeoffs => {
        get({
            table: 'writeoffs',
            where: {item_id: path[2]},
            func: getWriteoffs
        })
        .then(function ([result, options]) {
            set_count('writeoff', result.count);
            result.writeoffs.forEach(writeoff => {
                try {
                    let row = tbl_writeoffs.insertRow(-1);
                    add_cell(row, table_date(writeoff.createdAt));
                    add_cell(row, {text: writeoff.reason});
                    add_cell(row, {text: writeoff.qty});
                    add_cell(row, {append: new Link(`/writeoffs/${writeoff.writeoff_id}`).e});
                } catch (error) {
                    console.error(error);
                };
            });
        });
    })
};
window.addEventListener('load', function () {
    add_listener('reload', getWriteoffs);
    add_sort_listeners('writeoffs', getWriteoffs);
    getWriteoffs();
});