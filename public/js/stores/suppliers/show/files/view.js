function getFiles() {
    clear('tbl_files')
    .then(tbl_files => {
        get({
            table: 'files',
            where: {supplier_id: path[2]},
            func: getFiles
        })
        .then(function ([result, options]) {
            set_count('file', result.count);
            result.files.forEach(file => {
                let row = tbl_files.insertRow(-1);
                add_cell(row, {text: file.filename})
                add_cell(row, {text: file.description});
                add_cell(row, {
                    append: new Modal_Button(
                        _search(),
                        'file_view',
                        [{field: 'id', value: file.file_id}]
                    ).e
                });
            });
        });
    });
};
function viewFile(file_id) {
    get({
        table: 'file',
        where: {file_id: file_id}
    })
    .then(function ([file, options]) {
        set_attribute('form_file_download', 'action', `/files/${file.file_id}/download`);
        set_innerText('file_id',          file.file_id);
        set_innerText('file_filename',    file.filename);
        set_innerText('file_description', file.description);
        set_innerText('file_user',        print_user(file.user));
        set_innerText('file_createdAt',   print_date(file.createdAt, true));
        set_innerText('file_updatedAt',   print_date(file.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getFiles);
    modalOnShow('file_view', function (event) {viewFile(event.relatedTarget.dataset.id)});
    add_sort_listeners('files', getFiles);
    getFiles();
});