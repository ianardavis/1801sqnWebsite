function listGenders(options = {}) {
	return new Promise((resolve, reject) => {
		clear(options.select || 'sel_genders')
		.then(sel_genders => {
			get({
				table: 'genders',
				spinner: options.spinner || 'genders',
				...options
			})
			.then(function ([genders, options]) {
				if (options.blank === true) {
					sel_genders.appendChild(
						new Option({
							selected: (!options.selected),
							text:     options.blank_text || ''
						}).e
					);
				};
				genders.forEach(gender => {
					let value = '';
					if (options.id_only === true) value = gender.gender_id
					else						  value = `gender_id=${gender.gender_id}`
					sel_genders.appendChild(
						new Option({
							selected: (options.selected === gender.gender_id),
							text:  gender.gender,
							value: value
						}).e
					);
				});
				resolve(true);
			});
		})
		.catch(err => reject(err));
	});
};