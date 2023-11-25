const getGendersAdd = listGenders({
        blank:   {text: 'None'},
        select:  'sel_genders_add',
        spinner: 'genders_add'
    });
window.addEventListener( "load", function () {
    enableButton('item_add');
    modalOnShow('item_add', getGendersAdd);
    modalOnShow('item_add', get_size_descriptions);
    add_listener('reload_genders_add', getGendersAdd);
    addFormListener(
        'item_add',
        'POST',
        '/items',
        {onComplete: get_items}
    );
});