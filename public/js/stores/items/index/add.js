let getGendersAdd = listGenders({
        blank:   {text: 'None'},
        select:  'sel_genders_add',
        spinner: 'genders_add'
    });
window.addEventListener( "load", function () {
    modalOnShow('item_add', getGendersAdd);
    modalOnShow('item_add', get_size_descriptions);
    addListener('reload_genders_add', getGendersAdd);
    addFormListener(
        'item_add',
        'POST',
        '/items',
        {onComplete: getItems}
    );
});