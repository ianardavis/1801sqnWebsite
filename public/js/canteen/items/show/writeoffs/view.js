function getWriteoffs() {
    clear('tbl_writeoffs')
    .then(tbl_writeoffs => {
        get({
            table: 'writeoffs',
            where: {item_id: path[2]}
        })
        .then(function ([writeoffs, options]) {
            set_count('writeoff', writeoffs.length);
            writeoffs.forEach(writeoff => {
                try {
                    let row = tbl_writeoffs.insertRow(-1);
                    add_cell(row, table_date(writeoff.createdAt));
                    add_cell(row, {text: writeoff.reason});
                    add_cell(row, {text: writeoff.qty});
                    add_cell(row, {append: new Link({href: `/writeoffs/${writeoff.writeoff_id}`}).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    })
};
addReloadListener(getWriteoffs);