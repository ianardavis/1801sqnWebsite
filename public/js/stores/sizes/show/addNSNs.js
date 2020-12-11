function getNSNGroups() {
    get(
        function (nsn_groups, options) {
            let nsn_group_id = document.querySelector('#nsn_group_id');
            if (nsn_group_id) {
                nsn_group_id.innerHTML = '';
                nsn_group_id.appendChild(new Option({text: 'Select Group Code'}).e);
                nsn_groups.forEach(e => {
                    nsn_group_id.appendChild(new Option({
                        text: `${e._code} | ${e._group}`,
                        value: e.nsn_group_id,
                        selected: (e._code === 84)
                    }).e);
                });
            };
            getNSNClassifications();
        },
        {
            table: 'nsn_groups',
            query: []
        }
    )
};
function getNSNClassifications() {
    let nsn_group_id          = document.querySelector('#nsn_group_id'),
        nsn_classification_id = document.querySelector('#nsn_classification_id');
    if (nsn_group_id && nsn_classification_id) {
        nsn_classification_id.innerHTML = '';
        if (nsn_group_id.value !== '') {
            get(
                function (nsn_classifications, options) {
                    nsn_classification_id.appendChild(new Option({text: 'Select Classification Code', selected: true}).e);
                    nsn_classifications.forEach(e => {
                        nsn_classification_id.appendChild(new Option({
                            text: `${e._code} | ${e._classification}`,
                            value: e.nsn_classification_id
                        }).e);
                    });
                },
                {
                    table: 'nsn_classifications',
                    query: [`nsn_group_id=${nsn_group_id.value}`]
                }
            )
        };
    };
};
function getNSNCountries() {
    let nsn_country_id = document.querySelector('#nsn_country_id');
        if (nsn_country_id) {
        nsn_country_id.innerHTML = '';
        get(
            function (nsn_countries, options) {
                nsn_country_id.appendChild(new Option({text: 'Select Country Code'}).e);
                nsn_countries.forEach(e => {
                    nsn_country_id.appendChild(new Option({
                        text: `${e._code} | ${e._country}`,
                        value: e.nsn_country_id,
                        selected: (e._code === 99)
                    }).e);
                });
            },
            {
                table: 'nsn_countries',
                query: []
            }
        );
    };
};
window.addEventListener( "load", () => {
    let nsn_group_id = document.querySelector('#nsn_group_id');
    if (nsn_group_id) nsn_group_id.addEventListener('change', getNSNClassifications);
    addFormListener(
        'form_add_nsn',
        'POST',
        '/stores/nsns',
        {onComplete: getNSNs}
    );
});