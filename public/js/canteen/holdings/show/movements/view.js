function getMovements() {
    clear('tbl_movements')
    .then(tbl_movements => {
        get({
            table: 'movements_holding',
            spinner: 'movements',
            where: {holding_id: path[2]},
            func: getMovements
        })
        .then(function ([results, options]) {
            setCount('movement', results.count);
            results.movements.forEach(movement => {
                let row = tbl_movements.insertRow(-1);
                add_cell(row, {text: print_date(movement.createdAt)});
                add_cell(row, {text: (movement.holding_id_to === path[2] ? 'In' : (movement.holding_id_from === path[2] ? 'Out' : '?'))});
                add_cell(row, {text: movement.type});
                add_cell(row, {text: `£${Number(movement.amount).toFixed(2)}`});
                add_cell(row, {text: movement.description});
                add_cell(row, {append: new Link(`/movements/${movement.movement_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getMovements);
});