function getGenders() {
    listGenders({
        blank_text: 'All',
        select: 	'sel_genders',
        blank: 		true
    })
    .then(getItems);
};
window.addEventListener('load', function () {
    addListener('sel_genders',    getItems, 'change');
    addListener('reload_genders', getGenders);
});