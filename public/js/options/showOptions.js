showOptions = (results, options) => {
    let tables = [];
    if (options.table === 'categories')  tables = ['groups', 'types', 'subtypes']
    else if (options.table === 'groups') tables = ['types', 'subtypes']
    else if (options.table === 'types')  tables = ['subtypes'];
    tables.forEach(table => {
        let _sel = document.querySelector(`#${table}Select`);
        _sel.innerHTML = '';
    });
    let _select = document.querySelector(`#${options.table}Select`);
    _select.innerHTML = '';
    _select.appendChild(new Option({value: '', text: ''}).option);
    results.forEach(result => {
        _select.appendChild(
            new Option({
                value: result[`${options.singular}_id`],
                text: result[`_${options.singular}`],
                selected: (options.selected === result[`${options.singular}_id`])
            }).option
        )
    });
    hide_spinner(options.table);
};
group_query = () => {
    let _select = document.querySelector('#categoriesSelect');
    if (_select.value === '') return [`category_id=-1`]
    else return [`category_id=${_select.value}`]
};
type_query = () => {
    let _select = document.querySelector('#groupsSelect');
    if (_select.value === '') return [`group_id=-1`]
    else return [`group_id=${_select.value}`]
};
subtype_query = () => {
    let _select = document.querySelector('#typesSelect');
    if (_select.value === '') return [`type_id=-1`]
    else return [`type_id=${_select.value}`]
};