let row_count = 0;
function selectedSizes(sizes) {
    if (sizes) {
        let tbl_line_add = document.querySelector('#tbl_line_add'),
            qty          = document.querySelector('#line_add_qty') || {value: '1'};
        get({
            table: 'demand',
            where: {demand_id: path[2]},
            spinner: 'line_add'
        })
        .then(function ([demand, options]) {
            sizes.forEach(size => {
                get({
                    table: 'size',
                    where: {size_id: size},
                    spinner: 'line_add'
                })
                .then(function([size, options]) {
                    if (size.orderable && !tbl_line_add.querySelector(`#size-${size.size_id}`)) {
                        if (size.supplier_id === demand.supplier_id) {
                            let row = tbl_line_add.insertRow(-1);
                            row.setAttribute('id', `size-${size.size_id}`);
                            add_cell(row, {text: size.item.description});
                            add_cell(row, {
                                text: print_size(size.size),
                                append: new Input({
                                    attributes: [
                                        {field: 'type',  value: 'hidden'},
                                        {field: 'name',  value: `lines[][${row_count}][size_id]`},
                                        {field: 'value', value: size.size_id}
                                    ]
                                }).e
                            });
                            add_cell(row, {append: new Input({
                                small: true,
                                attributes: [
                                    
                                    {field: 'type',  value: 'number'},
                                    {field: 'name',  value: `lines[][${row_count}][qty]`},
                                    {field: 'value', value: qty.value}
                                ]
                            }).e});
                            let delete_button = new Button({
                                small: true,
                                type: 'delete',
                                attributes: [{field: 'type', value: 'button'}],
                                data: [{field: 'id', value: size.size_id}]
                            }).e
                            delete_button.addEventListener('click', function () {removeID(`size-${this.dataset.id}`)});
                            add_cell(row, {append: delete_button});
                            row_count++;
                        };
                    };
                });
            });
        })
    };
};
function setAddButton() {
    get({
        table: 'demand',
        where: {demand_id: path[2]},
    })
    .then(function([demand, options]) {
        if (demand.status === 1) enable_button('line_add')
        else                     disable_button('line_add');    
    });
};
window.addEventListener('load', function () {
    setAddButton();
    addListener('btn_line_sizes', selectSize);
    modalOnShow('line_add', function () {clear('tbl_line_add')});
    addFormListener(
        'line_add',
        'POST',
        `/sizes/${path[2]}/demand`,
        {
            onComplete: [
                getLines,
                function () {modalHide('line_add')}
            ]
        }
    );
});