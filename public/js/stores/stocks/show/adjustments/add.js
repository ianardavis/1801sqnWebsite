function reset_count_add() {
    set_value('adjustment_qty_count');
};
function reset_scrap_add() {
    set_value('adjustment_qty_scrap');
};
window.addEventListener('load', function () {
    modalOnShow('count_add', reset_count_add);
    modalOnShow('scrap_add', reset_scrap_add);
    addFormListener(
        'count_add',
        'PUT',
        `/stocks/${path[2]}/count`,
        {
            onComplete: [
                getStock,
                function () {modalHide('count_add')}
            ]
        }
    );
    addFormListener(
        'scrap_add',
        'PUT',
        `/stocks/${path[2]}/scrap`,
        {
            onComplete: [
                getStock,
                function () {modalHide('scrap_add')}
            ]
        }
    );
});