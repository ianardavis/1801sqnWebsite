function listHeadings(options = {}) {
	return new Promise(resolve => {
		clear(options.select)
		.then(sel_headings => {
			get({
                table: 'resource_link_headings',
                ...options
            })
			.then(function ([headings, options]) {
				if (options.blank) {
					sel_headings.appendChild(
						new Option({
							selected: (!options.selected),
							text:     options.blank.text || ''
						}).e
					);
				};
				if (headings && headings.length > 0) {
					headings.forEach(heading => {
						sel_headings.appendChild(
							new Option({
								selected: (options.selected === heading.value),
								text:  heading.value,
								value: heading.value
							}).e
						);
					});
				};
				resolve(true);
			});
		})
		.catch(err => {
			console.error(err);
			resolve(false);
		});
	});
};