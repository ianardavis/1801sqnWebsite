function reset_count_add() {
    set_value('adjustment_qty_count');
};
window.addEventListener('load', function () {
    modalOnShow('count_add', reset_count_add);
    enable_button('count_add');
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
});