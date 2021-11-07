function getMovements() {
    clear('tbl_movements')
    .then(tbl_movements => {
        let sort_cols = tbl_movements.parentNode.querySelector('.sort') || null;
        get({
            table: 'movements_holding',
            spinner: 'movements',
            query: [`"holding_id":"${path[2]}"`],
            ...sort_query(sort_cols)
        })
        .then(function ([movements, options]) {
            set_count({id: 'movement', count: movements.length || '0'});
            movements.forEach(movement => {
                let row = tbl_movements.insertRow(-1);
                add_cell(row, {text: print_date(movement.createdAt)});
                add_cell(row, {text: (movement.holding_id_to === path[2] ? 'In' : (movement.holding_id_from === path[2] ? 'Out' : '?'))});
                add_cell(row, {text: movement.type});
                add_cell(row, {text: `£${Number(movement.amount).toFixed(2)}`});
                add_cell(row, {text: movement.description});
                add_cell(row,{
                    append: new Link({
                        href: `/movements/${movement.movement_id}`,
                        small: true
                    }).e
                });
            });
        });
    });
};
addReloadListener(getMovements);