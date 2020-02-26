function addSize(item) {
    let selectedList = document.querySelector('#selectedItems'),
        serial_id = item.serial_id || '';
        existingID   = document.querySelector('#id-' + item.stock_id + serial_id);
    if (typeof(existingID) === 'undefined' || existingID !== null) {
        return 'Item/Location already added!'
    } else {
        try {
            selectedList.appendChild(NewItemCard(item, 'stock_id'))
            return 'Item added'
        } catch (error) {
            return error.message
        }
    };
};