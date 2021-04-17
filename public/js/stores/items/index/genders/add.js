function getGendersAdd() {
    listGenders({
        blank_text: 'All',
        select: 	'genders_add',
        spinner:    'genders_add',
        blank: 		true,
        blank_text: 'None',
        id_only: true
    });
};
window.addEventListener( "load", function () {
    $('#mdl_item_add').on('show.bs.modal', getGendersAdd);
    addClickListener('reload_genders_add', getGendersAdd);
});