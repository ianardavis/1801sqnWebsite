function getMovements() {
    clear('tbl_movements')
    .then(tbl_movements => {
        let sort_cols = tbl_movements.parentNode.querySelector('.sort') || null;
        get({
            table: 'movements',
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([movements, options]) {
            movements.forEach(movement => {
                let row = tbl_movements.insertRow(-1);
                add_cell(row, {text: (movement.holding_from ? movement.holding_from.description : (movement.session ? 'Canteen Session' : ''))});
                add_cell(row, {text: (movement.holding_to   ? movement.holding_to.description : '')});
                add_cell(row, {text: movement.description});
                add_cell(row, {text: `£${Number(movement.amount).toFixed(2)}`});
                add_cell(row, {append: new Link({
                    href: `/movements/${movement.movement_id}`,
                    small: true
                }).e});
            });
        })
    });
};
addReloadListener(getMovements);
