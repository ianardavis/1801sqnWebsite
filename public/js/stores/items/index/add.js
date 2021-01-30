function getGenders_add () {
	let sel_genders = document.querySelector('#sel_genders_add');
	if (sel_genders) {
		get(
			function (genders, options) {
				sel_genders.innerHTML= '';
				sel_genders.appendChild(new Option({text: '', value: '', selected: true}).e);
				genders.forEach(gender => {
					sel_genders.appendChild(
						new Option({
							text:  gender._gender,
							value: gender.gender_id
						}).e
					)
				});
			},
			{
				table:   'genders',
                query:   [],
                spinner: 'genders_add'
			}
		);
	};
};
window.addEventListener( "load", function () {
    $('#mdl_item_add').on('show.bs.modal', getGenders_add);
    addFormListener(
        'form_item_add',
        'POST',
        '/stores/items',
        {onComplete: getItems}
    );
    document.querySelector('#reload_genders_add').addEventListener('click', getGenders_add);
});