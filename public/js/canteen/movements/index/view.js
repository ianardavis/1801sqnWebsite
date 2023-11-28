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
                addCell(row, {text: (movement.holding_from ? movement.holding_from.description : (movement.session ? 'Canteen Session' : ''))});
                addCell(row, {text: (movement.holding_to   ? movement.holding_to.description : '')});
                addCell(row, {text: movement.description});
                addCell(row, {text: `£${Number(movement.amount).toFixed(2)}`});
                addCell(row, {append: new Link(`/movements/${movement.movement_id}`).e});
            });
        })
    });
};
window.addEventListener('load', function () {
    addListener('reload', getMovements);
    addSortListeners('movements', getMovements);
    getMovements();
});