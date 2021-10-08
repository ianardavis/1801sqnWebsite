function get_size_descriptions() {
    clear('list_descriptions')
    .then(list_descriptions => {
        get({
            table: 'settings',
            query: ['name=Size Description']
        })
        .then(function ([descriptions, options]) {
            descriptions.forEach(e => list_descriptions.appendChild(new Option({value: e.value}).e));
        });
    });
};