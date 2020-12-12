function getNSNGroups(options = {}) {
    get(
        function (nsn_groups, options) {
            let nsn_group_id = document.querySelector(`#nsn_group_id_${options.select}`);
            if (nsn_group_id) {
                nsn_group_id.innerHTML = '';
                nsn_group_id.appendChild(new Option({text: 'Select Group Code', selected: (options.selected === null)}).e);
                nsn_groups.forEach(e => {
                    nsn_group_id.appendChild(
                        new Option({
                            text:     `${String(e._code).padStart(2, '0')} | ${e._group}`,
                            value:     e.nsn_group_id,
                            selected: (e.nsn_group_id === options.selected)
                        }).e
                    );
                });
            };
            getNSNClassifications({select: options.select, selected: options.selected_classification});
        },
        {
            table:                   'nsn_groups',
            query:                   [],
            select:                  options.select   || 'add',
            selected:                options.selected || 79,
            selected_classification: options.selected_classification || null
        }
    )
};
function getNSNClassifications(options = {}) {
    let group           = document.querySelector(`#nsn_group_id_${options.select}`),
        classifications = document.querySelector(`#nsn_classification_id_${options.select}`);
    if (group && classifications) {
        classifications.innerHTML = '';
        if (group.value !== '') {
            get(
                function (nsn_classifications, options) {
                    classifications.appendChild(
                        new Option({
                            text: 'Select Classification Code',
                            selected: (options.selected === null)
                        }).e
                    );
                    nsn_classifications.forEach(e => {
                        classifications.appendChild(
                            new Option({
                                text:     `${String(e._code).padStart(2, '0')} | ${e._classification}`,
                                value:     e.nsn_classification_id,
                                selected: (e.nsn_classification_id === options.selected)
                            }).e
                        );
                    });
                },
                {
                    table:    'nsn_classifications',
                    query:    [`nsn_group_id=${group.value}`],
                    select:   options.select   || 'add',
                    selected: options.selected || null
                }
            )
        };
    };
};
function getNSNCountries(options = {}) {
    let nsn_country_id = document.querySelector(`#nsn_country_id_${options.select || 'add'}`);
    if (nsn_country_id) {
        nsn_country_id.innerHTML = '';
        get(
            function (nsn_countries, options) {
                nsn_country_id.appendChild(
                    new Option({
                        text: 'Select Country Code'
                    }).e
                );
                nsn_countries.forEach(e => {
                    nsn_country_id.appendChild(
                        new Option({
                            text:     `${String(e._code).padStart(2, '0')} | ${e._country}`,
                            value:     e.nsn_country_id,
                            selected: (e.nsn_country_id === options.selected)
                        }).e
                    );
                });
            },
            {
                table:    'nsn_countries',
                query:    [],
                select:   options.select   || 'add',
                selected: options.selected || 82
            }
        );
    };
};