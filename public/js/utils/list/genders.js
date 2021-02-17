function listGenders(options = {}) {
	let sel_genders = document.querySelector(`#${options.select || 'sel_genders'}`);
	if (sel_genders) {
		get(
			{
				table: 'genders',
                spinner: options.spinner || 'genders',
                ...options
			},
			function (genders, options) {
				sel_genders.innerHTML= '';
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
							text:  gender._gender,
							value: value
						}).e
					);
				});
                if (options.onComplete) options.onComplete();
			}
		);
	} else if (options.onComplete) options.onComplete();
};