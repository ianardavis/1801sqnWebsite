function getMovements() {
    clear_table('movements')
    .then(tbl_movements => {
        get({table: 'movements'})
        .then(function ([movements, options]) {
            movements.forEach(movement => {
                let row = tbl_movements.insertRow(-1);
                add_cell(row, {text: (movement.holding_from ? movement.holding_from.description : (movement.session ? 'Canteen Session' : ''))});
                add_cell(row, {text: (movement.holding_to   ? movement.holding_to.description : '')});
                add_cell(row, {text: movement.type});
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
