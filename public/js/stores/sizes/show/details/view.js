function get_details() {
    clear('tbl_details')
    .then(tbl_details => {
        get({
            table: 'details',
            where: {size_id: path[2]},
            func: get_details
        })
        .then(function ([result, options]) {
            result.details.forEach(detail => {
                let row = tbl_details.insertRow(-1);
                addCell(row, {text: detail.name});
                addCell(row, {text: detail.value});
                addCell(row, {append: new Modal_Button(
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
        table: 'detail',
        where: {detail_id: detail_id}
    })
    .then(function ([detail, options]) {
        setInnerText('detail_id',        detail.detail_id);
        setInnerText('detail_name',      detail.name);
        setInnerText('detail_value',     detail.value);
        setInnerText('detail_createdAt', printDate(detail.createdAt));
        setInnerText('detail_updatedAt', printDate(detail.updatedAt));
    });
};
window.addEventListener('load', function () {
    addListener('reload', get_details);
    modalOnShow('detail_view', function (event) {
        if (event.relatedTarget.dataset.id) {
            viewDetail(event.relatedTarget.dataset.id)
        } else modalHide('detail_view');
    });
    addSortListeners('details', get_details);
    get_details();
});