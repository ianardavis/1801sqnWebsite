function getDetails() {
    clear('tbl_details')
    .then(tbl_details => {
        get({
            table: 'details',
            where: {size_id: path[2]},
            func: getDetails
        })
        .then(function ([result, options]) {
            result.details.forEach(detail => {
                let row = tbl_details.insertRow(-1);
                add_cell(row, {text: detail.name});
                add_cell(row, {text: detail.value});
                add_cell(row, {append: new Modal_Button(
                    _search(),
                    'detail_view',
                    [{field: 'id', value: detail.detail_id}]
                ).e});
            });
        });
    });
};
function viewDetail(detail_id) {
    get({
        table:   'detail',
        where:   {detail_id: detail_id},
        spinner: 'detail_view'
    })
    .then(function ([detail, options]) {
        set_innerText('detail_id',        detail.detail_id);
        set_innerText('detail_name',      detail.name);
        set_innerText('detail_value',     detail.value);
        set_innerText('detail_createdAt', print_date(detail.createdAt));
        set_innerText('detail_updatedAt', print_date(detail.updatedAt));
    });
};
addReloadListener(getDetails);
window.addEventListener('load', function () {
    modalOnShow('detail_view', function (event) {
        if (event.relatedTarget.dataset.id) {
            viewDetail(event.relatedTarget.dataset.id)
        } else modalHide('detail_view');
    });
    add_sort_listeners('details', getDetails);
    getDetails();
});