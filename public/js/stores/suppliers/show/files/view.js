function getFiles() {
    clear_table('files')
    .then(tbl_files => {
        get({
            table: 'files',
            query: [`supplier_id=${path[2]}`]
        })
        .then(function ([files, options]) {
            set_count({id: 'file', count: files.length || '0'});
            files.forEach(file => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: file.filename})
                add_cell(row, {text: file.description});
                add_cell(row, {
                    append: new Link({
                        modal: 'file_view',
                        data: {field: 'id', value: file.file_id},
                        small: true
                    }).e
                });
            });
        });
    });
};
function viewFile(file_id) {
    get({
        table: 'file',
        query: [`file_id=${file_id}`]
    })
    .then(function ([file, options]) {
        set_attribute({id: 'form_file_download', attribute: 'action', value: `/files/${file.file_id}/download`});
        set_innerText({id: 'file_id',          text: file.file_id});
        set_innerText({id: 'file_filename',    text: file.filename});
        set_innerText({id: 'file_description', text: file.description});
        set_innerText({id: 'file_user',        text: print_user(file.user)});
        set_innerText({id: 'file_createdAt',   text: print_date(file.createdAt, true)});
        set_innerText({id: 'file_updatedAt',   text: print_date(file.updatedAt, true)});
    });
};
window.addEventListener('load', function () {
    $('#mdl_file_view').on('show.bs.modal', function (event) {viewFile(event.relatedTarget.dataset.id)});
    document.querySelector('#reload').addEventListener('click', getFiles);
});