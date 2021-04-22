function getGenders_add () {
	clear_select('genders_add')
	.then(sel_genders => {
		get({
			table:   'genders',
			spinner: 'genders_add'
		})
		.then(function ([genders, options]) {
			sel_genders.appendChild(new Option({text: '', value: '', selected: true}).e);
			genders.forEach(gender => {
				sel_genders.appendChild(
					new Option({
						text:  gender.gender,
						value: gender.gender_id
					}).e
				);
			});
		});
	});
};
window.addEventListener( "load", function () {
    addFormListener(
        'item_add',
        'POST',
        '/items',
        {onComplete: getItems}
    );
});