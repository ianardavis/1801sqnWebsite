function getFiles() {
    clear('tbl_files')
    .then(tbl_files => {
        get({
            table: 'files',
            where: {supplier_id: path[2]},
            func: getFiles
        })
        .then(function ([result, options]) {
            setCount('file', result.count);
            result.files.forEach(file => {
                let row = tbl_files.insertRow(-1);
                addCell(row, {text: file.filename})
                addCell(row, {text: file.description});
                addCell(row, {
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
        setAttribute('form_file_download', 'action', `/files/${file.file_id}/download`);
        setInnerText('file_id',          file.file_id);
        setInnerText('file_filename',    file.filename);
        setInnerText('file_description', file.description);
        setInnerText('file_user',        printUser(file.user));
        setInnerText('file_createdAt',   printDate(file.createdAt, true));
        setInnerText('file_updatedAt',   printDate(file.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getFiles);
    modalOnShow('file_view', function (event) {viewFile(event.relatedTarget.dataset.id)});
    addSortListeners('files', getFiles);
    getFiles();
});