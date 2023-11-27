function resetTransferAdd() {
    setValue('transfer_add_location');
    setValue('transfer_add_qty');
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
    enableButton('transfer_add');
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
    add_listener('reload_locations_transfer', getLocations);
});