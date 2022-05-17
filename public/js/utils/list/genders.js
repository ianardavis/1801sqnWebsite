function listGenders(options = {}) {
	return new Promise(resolve => {
		clear(options.select || 'sel_genders')
		.then(sel_genders => {
			get({
				table: 'genders',
				spinner: options.spinner || 'genders',
				...options
			})
			.then(function ([result, options]) {
				if (options.blank) {
					sel_genders.appendChild(
						new Option({
							selected: (!options.selected),
							text:     options.blank.text || ''
						}).e
					);
				};
				result.genders.forEach(gender => {
					sel_genders.appendChild(
						new Option({
							selected: (options.selected === gender.gender_id || options.all_selected),
							text:  gender.gender,
							value: gender.gender_id
						}).e
					);
				});
				resolve(true);
			});
		})
		.catch(err => {
			console.log(err);
			resolve(false);
		});
	});
};