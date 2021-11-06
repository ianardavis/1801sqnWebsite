function getWriteoffs() {
    clear('tbl_writeoffs')
    .then(tbl_writeoffs => {
        let sort_cols = tbl_writeoffs.parentNode.querySelector('.sort') || null;
        get({
            table: 'writeoffs',
            query: [`item_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
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