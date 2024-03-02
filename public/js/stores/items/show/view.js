function getItem() {
    function disableAllButtons() {
        disableButton('delete');
    };
    function displayDetails([item, options]) {
        setBreadcrumb(item.description);
        setInnerText('item_description', item.description);
        setInnerText('item_size_text1',  item.size_text1);
        setInnerText('item_size_text2',  item.size_text2);
        setInnerText('item_size_text3',  item.size_text3);
        setInnerText('size_text1_sizes_table', item.size_text1);
        setInnerText('size_text2_sizes_table', item.size_text2);
        setInnerText('size_text3_sizes_table', item.size_text3);
        return item;
    };
    function setButtonStates(item) {
        if (typeof enable_edit_button   === 'function') enable_edit_button();
        if (typeof enable_delete_button === 'function') enable_delete_button();
        return item;
    };
    function setItemIDValues(item) {
        document.querySelectorAll('.item_id').forEach(e => e.setAttribute('value', item.item_id));
        return item;
    };

    disableAllButtons();
    get({
        table: 'item',
        where: {item_id: path[2]}
    })
    .then(displayDetails)
    .then(setButtonStates)
    .then(setItemIDValues)
    .catch(err => redirectOnError(err, '/items'));
};
window.addEventListener('load', function () {
    addListener('reload', getItem);
    getItem();
});