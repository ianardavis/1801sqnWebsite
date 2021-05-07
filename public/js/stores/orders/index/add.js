function reset_order_add() {
    clear_table('order_add');
    set_value({id: 'order_add_qty', value: '0'});
};

let row_count = 0;
function selectedSizes(sizes) {
    if (sizes) {
        let tbl_order_add = document.querySelector('#tbl_order_add'),
            qty           = document.querySelector('#order_add_qty') || {value: '1'};
            sizes.forEach(size => {
                get({
                    table: 'size',
                    query: [`size_id=${size}`],
                    spinner: 'line_add'
                })
                .then(function([size, options]) {
                    if (size.orderable && !tbl_order_add.querySelector(`#size-${size.size_id}`)) {
                        let row = tbl_order_add.insertRow(-1);
                        row.setAttribute('id', `size-${size.size_id}`);
                        add_cell(row, {text: size.item.description});
                        add_cell(row, {
                            text: size.size,
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
                            data: {field: 'id', value: size.size_id}
                        }).e
                        delete_button.addEventListener('click', function () {removeID(`size-${this.dataset.id}`)});
                        add_cell(row, {append: delete_button});
                        row_count++;
                    };
                });
            });
    };
};
window.addEventListener('load', function () {
    addListener('btn_order_sizes', selectSize);
    modalOnShow('order_add', reset_order_add);
    addFormListener(
        'order_add',
        'POST',
        '/orders',
        {
            onComplete: [
                getOrders,
                function () {modalHide('order_add')}
            ]
        }
    );
});