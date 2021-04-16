function getGenders() {
    listGenders({
        blank_text: 'All',
        select: 	'genders',
        blank: 		true
    })
    .then(getItems);
};
window.addEventListener('load', function () {
    document.querySelector('#sel_genders')   .addEventListener('change', getItems);
    document.querySelector('#reload_genders').addEventListener('click',  getGenders);
});