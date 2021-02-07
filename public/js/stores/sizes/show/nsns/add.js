function getNSNGroups(options = {}) {
    get(
        {
            table:                   'nsn_groups',
            query:                   [],
            selected:                options.selected || 79,
            selected_classification: options.selected_classification || null
        },
        function (nsn_groups, options) {
            let nsn_group_id = document.querySelector('#nsn_group_id_add');
            console.log(nsn_group_id);
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
        }
    )
};
function getNSNClassifications(options = {}) {
    let group           = document.querySelector('#nsn_group_id_add'),
        classifications = document.querySelector('#nsn_class_id_add');
    if (group && classifications) {
        classifications.innerHTML = '';
        if (group.value !== '') {
            get(
                {
                    table:    'nsn_classes',
                    query:    [`nsn_group_id=${group.value}`],
                    selected: options.selected || null
                },
                function (nsn_classes, options) {
                    classifications.appendChild(
                        new Option({
                            text: 'Select Classification Code',
                            selected: (options.selected === null)
                        }).e
                    );
                    nsn_classes.forEach(e => {
                        classifications.appendChild(
                            new Option({
                                text:     `${String(e._code).padStart(2, '0')} | ${e._classification}`,
                                value:     e.nsn_class_id,
                                selected: (e.nsn_class_id === options.selected)
                            }).e
                        );
                    });
                }
            )
        };
    };
};
function getNSNCountries(options = {}) {
    let nsn_country_id = document.querySelector('#nsn_country_id_add');
    if (nsn_country_id) {
        nsn_country_id.innerHTML = '';
        get(
            {
                table:    'nsn_countries',
                query:    [],
                selected: options.selected || 82
            },
            function (nsn_countries, options) {
                nsn_country_id.appendChild(
                    new Option({text: 'Select Country Code'}).e
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
            }
        );
    };
};
window.addEventListener( "load", function () {
    remove_attribute({id: 'btn_nsn_add', attribute: 'disabled'});
    addFormListener(
        'nsn_add',
        'POST',
        '/stores/nsns',
        {onComplete: getNSNs}
    );
    let groups = document.querySelector('#nsn_group_id_add');
    if (groups) groups.addEventListener('change', getNSNClassifications);
    $('#mdl_nsn_add').on('show.bs.modal', getNSNGroups);
    $('#mdl_nsn_add').on('show.bs.modal', getNSNCountries);
});