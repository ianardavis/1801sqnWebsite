function viewHoldingEdit() {
    get({
        table: 'holding',
        query: [`holding_id=${path[2]}`]
    })
    .then(function([holding, options]) {
        set_value({id: 'holding_description_edit', value: holding.description});
    });
};
window.addEventListener('load', function () {
    enable_button('holding_edit');
    enable_button('holding_count');
    modalOnShow('holding_edit', viewHoldingEdit);
    modalOnShow('holding_count', clearAllBalances);
    addFormListener(
        'holding_count',
        'PUT',
        `/holdings_count/${path[2]}`,
        {
            onComplete: [
                getHolding,
                getActions,
                function () {modalHide('holding_count')}
            ]
        }
    );
    addFormListener(
        'holding_edit',
        'PUT',
        `/holdings/${path[2]}`,
        {
            onComplete: [
                getHolding,
                function () {modalHide('holding_edit')}
            ]
        }
    );
});