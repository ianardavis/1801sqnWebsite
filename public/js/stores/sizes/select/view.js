function getItems() {
    listItems({
        select: 'sel_items',
        id_only: true
    })
    .catch(err => console.log(err));
};
function getSizes(item_id) {
    listItems({
        select: 'sel_items',
        id_only: true,
        query: [`item_id=${item_id}`]
    })
    .catch(err => console.log(err));
};
window.addEventListener('load', function () {
    
});