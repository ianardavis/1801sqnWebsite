function resetAddSize() {
    ['issueable', 'orderable', 'has_nsns', 'has_serials'].forEach(e => set_value({id: `size_${e}`, value: '0'}));
    ['size1', 'size2', 'size3'].forEach(e => set_value({id: `size_${e}`, value: ''}));
    getSuppliers();
};
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
function getSuppliers() {
    if (typeof listSuppliers === 'function') {
        listSuppliers({
            blank: true,
            blank_text: 'None'
        });
    };
};
window.addEventListener('load', function () {
    modalOnShow('size_add', get_size_descriptions);
    modalOnShow('size_add', resetAddSize);
    enable_button('size_add');
    addFormListener(
        'size_add',
        'POST',
        '/sizes',
        {onComplete: [
            getSizes,
            function () {['size1', 'size2', 'size3'].forEach(e => set_value({id: `size_${e}`, value: ''}));}
        ]}
    );
    addListener('reload_suppliers', getSuppliers);
});