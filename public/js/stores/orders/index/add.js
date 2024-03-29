function reset_order_add() {
    clear('tbl_order_add');
    setValue('order_add_qty', '0');
};
let row_count = 0;
function selectedSizes(sizes) {
    if (sizes) {
        let tbl_order_add = document.querySelector('#tbl_order_add'),
            qty           = document.querySelector('#order_add_qty') || {value: '1'};
            sizes.forEach(size => {
                get({
                    table: 'size',
                    where: {size_id: size},
                    spinner: 'line_add'
                })
                .then(function([size, options]) {
                    if (size.orderable && !tbl_order_add.querySelector(`#size-${size.size_id}`)) {
                        let row = tbl_order_add.insertRow(-1);
                        row.setAttribute('id', `size-${size.size_id}`);
                        addCell(row, {text: size.item.description});
                        addCell(row, {
                            text: printSize(size),
                            append: new Hidden_Input({
                                attributes: [
                                    {field: 'name',  value: `orders[][${row_count}][size_id]`},
                                    {field: 'value', value: size.size_id}
                                ]
                            }).e
                        });
                        addCell(row, {append: new Number_Input({
                            attributes: [
                                {field: 'name',  value: `orders[][${row_count}][qty]`},
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
                        addCell(row, {append: delete_button});
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