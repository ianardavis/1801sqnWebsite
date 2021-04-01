function getGenders_add () {
	let sel_genders = document.querySelector('#sel_genders_add');
	if (sel_genders) {
		get(
			{
				table:   'genders',
                spinner: 'genders_add'
			},
			function (genders, options) {
				sel_genders.innerHTML= '';
				sel_genders.appendChild(new Option({text: '', value: '', selected: true}).e);
				genders.forEach(gender => {
					sel_genders.appendChild(
						new Option({
							text:  gender.gender,
							value: gender.gender_id
						}).e
					)
				});
			}
		);
	};
};
window.addEventListener( "load", function () {
    $('#mdl_item_add').on('show.bs.modal', function () {
		listGenders({
			select: 'sel_genders_add',
			blank:  true,
			spinner: 'genders_add',
			id_only: true
		});
	});
    addFormListener(
        'item_add',
        'POST',
        '/stores/items',
        {onComplete: getItems}
    );
    document.querySelector('#reload_genders_add').addEventListener('click', function () {
		listGenders({
			select: 'sel_genders_add',
			blank: 	true,
			spinner: 'genders_add',
			id_only: true
		});
	});
});