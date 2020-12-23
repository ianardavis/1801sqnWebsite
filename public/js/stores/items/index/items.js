function item_query() {
    let sel_category = document.querySelector('#sel_categories'),
        sel_group    = document.querySelector('#sel_groups'),
        sel_type     = document.querySelector('#sel_types'),
        sel_subtype  = document.querySelector('#sel_subtypes'),
        sel_gender   = document.querySelector('#sel_genders'),
        query        = [];
    if (sel_category.value !== '') query.push(`category_id=${sel_category.value}`);
    if (sel_group.value !== '')    query.push(`group_id=${sel_group.value}`);
    if (sel_type.value !== '')     query.push(`type_id=${sel_type.value}`);
    if (sel_subtype.value !== '')  query.push(`subtype_id=${sel_subtype.value}`);
    if (sel_gender.value !== '')   query.push(`gender_id=${sel_gender.value}`);
    return query;
};
function getItems() {
    get(
        function (items, options) {
            clearElement('tbl_items');
            let table_body = document.querySelector('#tbl_items');
            items.forEach(item => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    text: item._description,
                    classes: ['search']
                });
                add_cell(row, {append: new Link({
                    href: `/stores/items/${item.item_id}`,
                    small: true
                }).e});
            });
        },
        {
            table: 'items',
            query: item_query()
        }
    )
};
window.addEventListener( "load", () => {
    let sel_categories = document.querySelector('#sel_categories'),
        sel_groups 	   = document.querySelector('#sel_groups'),
        sel_types 	   = document.querySelector('#sel_types'),
        sel_subtypes   = document.querySelector('#sel_subtypes');
    if (sel_categories && sel_groups) {
        sel_categories.addEventListener('change', function () {
            sel_groups.innerHTML = '';
            sel_types.innerHTML = '';
            sel_subtypes.innerHTML = '';
            if (sel_categories.value !== '') {
                get(
                    function (groups, options) {
                        sel_groups.appendChild(new Option({text: '', value: '', selected: true}).e);
                        groups.forEach(e => {
                            sel_groups.appendChild(
                                new Option({
                                    text: e._group,
                                    value: e.group_id
                                }).e
                            )
                        });
                    },
                    {
                        table: 'groups',
                        query: [`category_id=${sel_categories.value}`]
                    }
                );
            };
            getItems();
        });
    };
    if (sel_groups && sel_types) {
        sel_groups.addEventListener('change', function () {
            sel_types.innerHTML = '';
            sel_subtypes.innerHTML = '';
            if (sel_groups.value !== '') {
                get(
                    function (types, options) {
                        sel_types.appendChild(new Option({text: '', value: '', selected: true}).e);
                        types.forEach(e => {
                            sel_types.appendChild(
                                new Option({
                                    text: e._type,
                                    value: e.type_id
                                }).e
                            )
                        });
                    },
                    {
                        table: 'types',
                        query: [`group_id=${sel_groups.value}`]
                    }
                );
            };
            getItems();
        });
    };
    if (sel_types && sel_subtypes) {
        sel_types.addEventListener('change', function () {
            sel_subtypes.innerHTML = '';
            if (sel_types.value !== '') {
                get(
                    function (subtypes, options) {
                        sel_subtypes.appendChild(new Option({text: '', value: '', selected: true}).e);
                        subtypes.forEach(e => {
                            sel_subtypes.appendChild(
                                new Option({
                                    text: e._subtype,
                                    value: e.subtype_id
                                }).e
                            )
                        });
                    },
                    {
                        table: 'subtypes',
                        query: [`type_id=${sel_types.value}`]
                    }
                );
                getItems();
            };
        });
    };
});
document.querySelector('#reload').addEventListener('click', getItems);