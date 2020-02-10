function addSize(item) {
    let selectedList = document.querySelector('#selectedItems'),
        existingID   = document.querySelector('#id-' + item.stock_id);
    if (typeof(existingID) === 'undefined' || existingID !== null) {
        return 'Item/Location already added!'
    } else {
        try {
            selectedList.appendChild(NewItemCard(item))
            return 'Item added'
        } catch (error) {
            return error.message
        }
    };
};