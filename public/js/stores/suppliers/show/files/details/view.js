function viewDetails(file_id) {
    clear('tbl_file_details')
    .then(tbl_file_details => {
        get({
            table: 'file_details',
            where: {file_id: file_id}
        })
        .then(function ([result, options]) {
            result.details.forEach(e => {
                let row = tbl_file_details.insertRow(-1);
                addCell(row, {text: e.name});
                addCell(row, {text: e.value});
                addCell(row, {classes: ['file_details_edit'],   data: [{field: 'id', value: e.file_detail_id}]});
                addCell(row, {classes: ['file_details_delete'], data: [{field: 'id', value: e.file_detail_id}]});
            });
            if (typeof addDetailDeleteBtns === 'function') addDetailDeleteBtns();
            if (typeof addDetailEditBtns   === 'function') addDetailEditBtns();
        });
    });
};
window.addEventListener('load', function () {
    modalOnShow('file_view', function (event) {viewDetails(event.relatedTarget.dataset.id)});
});