function viewFile(file_id) {
    get(
        {
            table: 'file',
            query: [`file_id=${file_id}`]
        },
        function (file, options) {
            set_attribute({id: 'form_file_download', attribute: 'action', value: `/files/${file.file_id}/download`});
            set_innerText({id: 'file_id_view', text: file.file_id});
            set_innerText({id: '_filename',    text: file._filename});
            set_innerText({id: '_description', text: file._description});
            set_innerText({id: 'user_file',    text: print_user(file.user)});
            set_innerText({id: 'createdAt',    text: print_date(file.createdAt, true)});
            set_innerText({id: 'updatedAt',    text: print_date(file.updatedAt, true)});
        }
    );
};
function getFiles() {
    let table_body = document.querySelector('#tbl_files');
    if (table_body) {
        table_body.innerHTML = '';
        get(
            {
                table: 'files',
                query: [`supplier_id=${path[2]}`]
            },
            function (files, options) {
                set_count({id: 'file', count: files.length || '0'});
                files.forEach(file => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: file._filename})
                    add_cell(row, {text: file._description});
                    add_cell(row, {
                        append: new Link({
                            modal: 'file_view',
                            data: {field: 'id', value: file.file_id},
                            small: true
                        }).e
                    });
                });
            }
        );
    };
};
window.addEventListener('load', function () {
    $('#mdl_file_view').on('show.bs.modal', function (event) {viewFile(event.relatedTarget.dataset.id)});
    document.querySelector('#reload').addEventListener('click', getFiles);
});