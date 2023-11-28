function get_files() {
    clear('tbl_files')
    .then(tbl_files => {
        get({
            table: 'files'
        })
        .then(function ([results, options]) {
            get({table: 'fs_files'})
            .then(function ([fs, options]) {
                let table_files = [];
                results.files.forEach(file => {
                    const index = fs.indexOf(file.filename);
                    if (index > -1) fs.splice(index, 1);
                    table_files.push({file_id: file.file_id, filename: file.filename, exists: (index !== -1)});
                });
                fs.forEach(file => table_files.push({filename: file, exists: 'Yes'}));
                table_files.forEach(file => {
                    let row = tbl_files.insertRow(-1);
                    addCell(row, {text: file.file_id || ''});
                    addCell(row, {text: file.filename, classes: ['text-start']});
                    addCell(row, (file.exists ? {html: _check()} : null))
                    addCell(row, {
                        classes: ['files'],
                        data: [
                            (file.file_id ? {field: 'id', value: file.file_id} : {field: 'file', value: file.filename})
                        ]
                    });
                });
                if (typeof addFileDeleteBtns === 'function') addFileDeleteBtns();
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', get_files);
    addSortListeners('files', get_files);
    get_files();
});