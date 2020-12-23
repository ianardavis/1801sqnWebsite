function showOptions(results, options) {
    let select = document.querySelector(`#sel_${options.table}_edit`);
    if (select) {
        select.innerHTML = '';
        select.appendChild(new Option({value: '', text: '', selected: (options.selected === null)}).e)
        results.forEach(e => {
            select.appendChild(new Option({
                value: e[`${options.singular}_id`],
                text:  e[`_${options.singular}`],
                selected: (options.selected === e[`${options.singular}_id`])
            }).e)
        });
    };
};
function getItemEdit() {
    get(
        function (item, options) {
            ['description', 'size_text'].forEach(e => {
                try {
                    document.querySelector(`#_${e}_edit`).setAttribute('value', item[`_${e}`]);
                } catch (error) {console.log(error)};
            });
            ['category', 'group', 'type', 'subtype', 'gender'].forEach(e => {
                try {
                    let _element = document.querySelector(`#_${e}`);
                    if (item[e]) {_element.innerText = item[e][`_${e}`]};
                } catch (error) {console.log(error)};
            });
            get(showOptions, {table: 'categories', query: [], singular: 'category', selected: item.category_id})
            .then(result => {
                if (item.category_id) {
                    get(showOptions, {table: 'groups', query: [`category_id=${item.category_id}`], singular: 'group', selected: item.group_id})
                    .then(result => {
                        if (item.group_id) {
                            get(showOptions, {table: 'types', query: [`group_id=${item.group_id}`], singular: 'type', selected: item.type_id})
                            .then(result => {
                                if (item.type_id) {
                                    get(showOptions, {table: 'subtypes', query: [`type_id=${item.type_id}`], singular: 'subtype', selected: item.subtype_id});
                                };
                            });
                        };
                    });
                };
            });
            get(showOptions, {table: 'genders', query: [], singular: 'gender', selected: item.gender_id});
        },
        {
            table: 'item',
            query: [`item_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getItemEdit);
window.addEventListener('load', function () {
    addFormListener(
        'form_item_edit',
        'PUT',
        `/stores/items/${path[3]}`,
        {onComplete: [
            getItem,
            function () {$('#mdl_item_edit').modal('hide')}
        ]}
    )
});