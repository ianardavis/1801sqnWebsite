function getWriteoffs() {
    clear_table('writeoffs')
    .then(tbl_writeoffs => {
        get({
            table: 'writeoffs',
            query: [`item_id=${path[2]}`]
        })
        .then(function ([writeoffs, options]) {
            set_count({id: 'writeoff', count: writeoffs.length || '0'});
            writeoffs.forEach(writeoff => {
                try {
                    let row = tbl_writeoffs.insertRow(-1);
                    add_cell(row, table_date(writeoff.createdAt));
                    add_cell(row, {text: writeoff.reason});
                    add_cell(row, {text: writeoff.qty});
                    add_cell(row, {append: new Link({
                        href: `/writeoffs/${writeoff.writeoff_id}`,
                        small: true
                    }).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    })
};
addReloadListener(getWriteoffs);