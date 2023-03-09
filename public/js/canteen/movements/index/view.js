function getMovements() {
    clear('tbl_movements')
    .then(tbl_movements => {
        get({
            table: 'movements',
            func: getMovements
        })
        .then(function ([results, options]) {
            results.movements.forEach(movement => {
                let row = tbl_movements.insertRow(-1);
                add_cell(row, {text: (movement.holding_from ? movement.holding_from.description : (movement.session ? 'Canteen Session' : ''))});
                add_cell(row, {text: (movement.holding_to   ? movement.holding_to.description : '')});
                add_cell(row, {text: movement.description});
                add_cell(row, {text: `£${Number(movement.amount).toFixed(2)}`});
                add_cell(row, {append: new Link(`/movements/${movement.movement_id}`).e});
            });
        })
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getMovements);
    add_sort_listeners('movements', getMovements);
    getMovements();
});