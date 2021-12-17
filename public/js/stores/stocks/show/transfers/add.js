function resetTransferAdd() {
    set_value('transfer_add_location');
    set_value('transfer_add_qty');
};
function viewTransferAdd() {
    get({
        table: 'stock',
        where: {stock_id: path[2]}
    })
    .then(function ([stock, options]) {
        if (stock.qty <= 0) {
            alert_toast('This stock location has no stock. Transfer is not possible');
            modalHide('transfer_add');
        } else {
            set_attribute('transfer_add_qty', 'max', stock.qty);
        };
    });
};
window.addEventListener('load', function () {
    enable_button('transfer_add');
    addFormListener(
        'transfer_add',
        'PUT',
        `/stocks/${path[2]}/transfer`,
        {
            onComplete: [
                getStock,
                function () {modalHide('transfer_add')}
            ]
        }
    );
    modalOnShow('transfer_add', resetTransferAdd);
    modalOnShow('transfer_add', viewTransferAdd);
    modalOnShow('transfer_add', getLocations);
    addListener('reload_locations_transfer', getLocations);
});