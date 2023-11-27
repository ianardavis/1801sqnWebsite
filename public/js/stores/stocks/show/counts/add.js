function resetCount_add() {
    setValue('adjustment_qty_count');
};
window.addEventListener('load', function () {
    modalOnShow('count_add', resetCount_add);
    enableButton('count_add');
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