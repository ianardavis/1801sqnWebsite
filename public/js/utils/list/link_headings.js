function listHeadings(options = {}) {
	return new Promise(resolve => {
		clear(options.select || 'sel_headings')
		.then(sel_headings => {
			get({
                table: 'settings',
                where: {name: 'link_heading'},
                ...options
            })
			.then(function ([result, options]) {
				if (options.blank) {
					sel_headings.appendChild(
						new Option({
							selected: (!options.selected),
							text:     options.blank.text || ''
						}).e
					);
				};
				result.settings.forEach(heading => {
					sel_headings.appendChild(
						new Option({
							selected: (options.selected === heading.value),
							text:  heading.value,
							value: heading.heading
						}).e
					);
				});
				resolve(true);
			});
		})
		.catch(err => {
			console.error(err);
			resolve(false);
		});
	});
};