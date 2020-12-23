window.addEventListener( "load", () => {
    let sel_categories_add = document.querySelector('#sel_categories_add'),
        sel_groups_add 	   = document.querySelector('#sel_groups_add'),
        sel_types_add 	   = document.querySelector('#sel_types_add'),
        sel_subtypes_add   = document.querySelector('#sel_subtypes_add');
    if (sel_categories_add && sel_groups_add) {
        sel_categories_add.addEventListener('change', function () {
            sel_groups_add.innerHTML = '';
            sel_types_add.innerHTML = '';
            sel_subtypes_add.innerHTML = '';
            if (sel_categories_add.value !== '') {
                get(
                    function (groups, options) {
                        sel_groups_add.appendChild(new Option({text: '', value: '', selected: true}).e);
                        groups.forEach(e => {
                            sel_groups_add.appendChild(
                                new Option({
                                    text: e._group,
                                    value: e.group_id
                                }).e
                            )
                        });
                    },
                    {
                        table: 'groups',
                        query: [`category_id=${sel_categories_add.value}`]
                    }
                );
            };
        });
    };
    if (sel_groups_add && sel_types_add) {
        sel_groups_add.addEventListener('change', function () {
            sel_types_add.innerHTML = '';
            sel_subtypes_add.innerHTML = '';
            if (sel_groups_add.value !== '') {
                get(
                    function (types, options) {
                        sel_types_add.appendChild(new Option({text: '', value: '', selected: true}).e);
                        types.forEach(e => {
                            sel_types_add.appendChild(
                                new Option({
                                    text: e._type,
                                    value: e.type_id
                                }).e
                            )
                        });
                    },
                    {
                        table: 'types',
                        query: [`group_id=${sel_groups_add.value}`]
                    }
                );
            };
        });
    };
    if (sel_types_add && sel_subtypes_add) {
        sel_types_add.addEventListener('change', function () {
            sel_subtypes_add.innerHTML = '';
            if (sel_types_add.value !== '') {
                get(
                    function (subtypes, options) {
                        sel_subtypes_add.appendChild(new Option({text: '', value: '', selected: true}).e);
                        subtypes.forEach(e => {
                            sel_subtypes_add.appendChild(
                                new Option({
                                    text: e._subtype,
                                    value: e.subtype_id
                                }).e
                            )
                        });
                    },
                    {
                        table: 'subtypes',
                        query: [`type_id=${sel_types_add.value}`]
                    }
                );
            };
        });
    };
    addFormListener(
        'form_item_add',
        'POST',
        '/stores/items',
        {onComplete: getItems}
    );
});