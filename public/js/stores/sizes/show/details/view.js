function getDetails() {
    clear('tbl_details')
    .then(tbl_details => {
        get({
            table: 'details',
            query: [`size_id=${path[2]}`]
        })
        .then(function ([details, options]) {
            details.forEach(detail => {
                let row = tbl_details.insertRow(-1);
                add_cell(row, {text: detail.name});
                add_cell(row, {text: detail.value});
                add_cell(row, {append: new Button({
                    modal: 'detail_view',
                    data: [{field: 'id', value: detail.detail_id}],
                    small: true
                }).e});
            });
        });
    });
};
function viewDetail(detail_id) {
    get({
        table:   'detail',
        query:   [`detail_id=${detail_id}`],
        spinner: 'detail_view'
    })
    .then(function ([detail, options]) {
        set_innerText({id: 'detail_id',        text: detail.detail_id});
        set_innerText({id: 'detail_name',      text: detail.name});
        set_innerText({id: 'detail_value',     text: detail.value});
        set_innerText({id: 'detail_createdAt', text: print_date(detail.createdAt)});
        set_innerText({id: 'detail_updatedAt', text: print_date(detail.updatedAt)});
    });
};
addReloadListener(getDetails);
window.addEventListener('load', function () {
    modalOnShow('detail_view', function (event) {
        if (event.relatedTarget.dataset.id) {
            viewDetail(event.relatedTarget.dataset.id)
        } else modalHide('detail_view');
    });
});