function getAdjustments() {
    clear('tbl_adjustments')
    .then(tbl_adjustments => {
        get({
            table: 'adjustments',
            query: [`stock_id=${path[2]}`]
        })
        .then(function([adjustments, options]) {
            set_count({id: 'adjustment', count: adjustments.length || '0'});
            adjustments.forEach(adjustment => {
                let row = tbl_adjustments.insertRow(-1);
                add_cell(row, table_date(adjustment.createdAt));
                add_cell(row, {text: adjustment.type});
                add_cell(row, {text: adjustment.qty});
                add_cell(row, {text: adjustment.variance});
                add_cell(row, {append: new Button({
                    modal: 'adjustment_view',
                    data: [{field: 'id', value: adjustment.adjustment_id}],
                    small: true
                }).e});
            });
        });
    });
};
function viewAdjustment(adjustment_id) {
    get({
        table: 'adjustment',
        query: [`adjustment_id=${adjustment_id}`]
    })
    .then(function ([adjustment, options]) {
        set_innerText({id: 'adjustment_id',        text: adjustment.adjustment_id});
        set_innerText({id: 'adjustment_item',      text: adjustment.size.item.description});
        set_innerText({id: 'adjustment_size',      text: adjustment.size.size});
        set_innerText({id: 'adjustment_type',      text: adjustment.type});
        set_innerText({id: 'adjustment_qty',       text: adjustment.qty});
        set_innerText({id: 'adjustment_variance',  text: adjustment.variance || '0'});
        set_innerText({id: 'adjustment_user',      text: print_user(adjustment.user)});
        set_innerText({id: 'adjustment_createdAt', text: print_date(adjustment.createdAt, true)});
        set_href({id: 'adjustment_item_link', value: `/items/${adjustment.size.item_id}`});
        set_href({id: 'adjustment_size_link', value: `/sizes/${adjustment.size_id}`});
        set_href({id: 'adjustment_user_link', value: `/users/${adjustment.user_id}`});
    })
};
window.addEventListener('load', function () {
    modalOnShow('adjustment_view', function (event) {viewAdjustment(event.relatedTarget.dataset.id)});
});