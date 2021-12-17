function getNSNGroups(options = {}) {
    clear('sel_nsn_groups')
    .then(sel_nsn_groups => {
        get({
            table:                   'nsn_groups',
            selected:                options.selected,
            selected_classification: options.selected_classification || null
        })
        .then(function ([nsn_groups, options]) {
            sel_nsn_groups.appendChild(new Option({
                text: 'Select Group Code',
                selected: (options.selected === null)
            }).e);
            let selected = options.selected;
            nsn_groups.forEach(e => {
                if (!options.selected && e.code === 84) selected = true
                sel_nsn_groups.appendChild(
                    new Option({
                        text:     `${String(e.code).padStart(2, '0')} | ${e.group}`,
                        value:     e.nsn_group_id,
                        selected: (options.selected ? (e.nsn_group_id === options.selected) : (e.code === 84))
                    }).e
                );
            });
            getNSNClassifications({select: options.select, selected: options.selected_classification});
        });
    });
};
function getNSNClassifications(options = {}) {
    clear('sel_nsn_classes')
    .then(sel_nsn_classes => {
        let group = document.querySelector('#sel_nsn_groups');
        if (group) {
            get({
                table:    'nsn_classes',
                where: {nsn_group_id: group.value},
                selected: options.selected || null
            })
            .then(function ([nsn_classes, options]) {
                sel_nsn_classes.appendChild(
                    new Option({
                        text: 'Select Classification Code',
                        selected: (options.selected === null)
                    }).e
                );
                nsn_classes.forEach(e => {
                    sel_nsn_classes.appendChild(
                        new Option({
                            text:     `${String(e.code).padStart(2, '0')} | ${e.class}`,
                            value:     e.nsn_class_id,
                            selected: (e.nsn_class_id === options.selected)
                        }).e
                    );
                });
            });
        };
    });
};
function getNSNCountries(options = {}) {
    clear('sel_nsn_countries')
    .then(sel_nsn_countries => {
        get({
            table:    'nsn_countries',
            selected: options.selected
        })
        .then(function ([nsn_countries, options]) {
            sel_nsn_countries.appendChild(
                new Option({text: 'Select Country Code'}).e
            );
            nsn_countries.forEach(e => {
                sel_nsn_countries.appendChild(
                    new Option({
                        text:     `${String(e.code).padStart(2, '0')} | ${e.country}`,
                        value:     e.nsn_country_id,
                        selected: (options.selected ? (e.nsn_country_id === options.selected) : (e.code === 99))
                    }).e
                );
            });
        });
    });
};