function viewDetails(file_id) {
    get(
        {
            table: 'file_details',
            query: [`file_id=${file_id}`]
        },
        function (details, options) {
            let tbl_file_details = document.querySelector('#tbl_file_details')
            if (tbl_file_details) {
                tbl_file_details.innerHTML = '';
                details.forEach(e => {
                    let row = tbl_file_details.insertRow(-1);
                    add_cell(row, {text: e._name});
                    add_cell(row, {text: e._value});
                    add_cell(row, {classes: ['file_details_edit'],   data: {field: 'id', value: e.file_detail_id}});
                    add_cell(row, {classes: ['file_details_delete'], data: {field: 'id', value: e.file_detail_id}});
                });
                if (typeof addDetailDeleteBtns === 'function') addDetailDeleteBtns();
                if (typeof addDetailEditBtns   === 'function') addDetailEditBtns();
            };
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_file_view').on('show.bs.modal', function (event) {viewDetails(event.relatedTarget.dataset.id)});
});