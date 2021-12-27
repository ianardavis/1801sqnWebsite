function getItems() {
    listItems({
        select:  'sel_items',
        blank:   {text: 'Select Item...'},
        id_only: true
    });
};
function getSizes() {
    clear('tbl_sizes')
    .then(tbl_sizes => {
        let item_id = document.querySelector('#sel_items') || {value: ''};
        if (item_id.value) {
            get({
                table: 'sizes',
                where: {
                    item_id: item_id.value,
                    orderable: true
                }
            })
            .then(function ([result, options]) {
                let index = 0;
                result.sizes.forEach(size => {
                    let row = tbl_sizes.insertRow(-1);
                    add_cell(row, {
                        text: size.size1,
                        append: [
                            new Hidden({
                                attributes: [
                                    {field: 'name',  value: `sizes[][${index}][size_id]`},
                                    {field: 'value', value: size.size_id}
                                ]
                            }).e
                        ]
                    });
                    add_cell(row, {text: size.size2});
                    add_cell(row, {text: size.size3});
                    add_cell(row, {id: `${size.size_id}_page`});
                    add_cell(row, {id: `${size.size_id}_cell`});
                    add_cell(row, {append: new Link({href: `/sizes/${size.size_id}`}).e});
                    addInput(size.size_id, 'Page', index);
                    addInput(size.size_id, 'Cell', index);
                    index++;
                })
            });
        };
    });
};
function addInput(size_id, _cell, index) {
    let cell = document.querySelector(`#${size_id}_${_cell.toLowerCase()}`);
    if (cell) {
        get({
            table: 'detail',
            where: {
                size_id: size_id,
                name: `Demand ${_cell}`
            }
        })
        .then(function ([detail, options]) {
            cell.appendChild(new Input({
                small: true,
                attributes: [
                    {field: 'name',  value: `sizes[][${index}][${_cell}]`},
                    {field: 'value', value: detail.value ||''}
                ]
            }).e);
        })
        .catch(err => {
            cell.appendChild(new Input({
                small: true,
                attributes: [{field: 'name',  value: `sizes[][${index}][${_cell}]`}]
            }).e);
        });
    };
};
addReloadListener(getItems);
sort_listeners(
    'items',
    getItems,
    [
        {value: 'createdAt',   text: 'Created'},
        {value: 'description', text: 'Description', selected: true}
    ]
);
sort_listeners(
    'sizes',
    getSizes,
    [
        {value: 'createdAt', text: 'Created'},
        {value: 'size1',     text: 'Size 1', selected: true},
        {value: 'size2',     text: 'Size 2'},
        {value: 'size3',     text: 'Size 3'}
    ]
);
window.addEventListener('load', function () {
    addListener('sel_items', getSizes, 'input');
    addFormListener(
        'sizes',
        'PUT',
        '/details',
        {onComplete: getSizes}
    );
});