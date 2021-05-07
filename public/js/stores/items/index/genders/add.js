function getGendersAdd() {
    listGenders({
        blank_text: 'All',
        select: 	'genders_add',
        spinner:    'genders_add',
        blank: 		true,
        blank_text: 'None',
        id_only:    true
    });
};
window.addEventListener( "load", function () {
    modalOnShow('item_add', getGendersAdd);
    addListener('reload_genders_add', getGendersAdd);
});