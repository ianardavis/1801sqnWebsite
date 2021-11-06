function getFiles() {
    clear('tbl_files')
    .then(tbl_files => {
        let sort_cols = tbl_files.parentNode.querySelector('.sort') || null;
        get({
            table: 'files',
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([files, options]) {
            get({table: 'fs_files'})
            .then(function ([fs, options]) {
                let table_files = [];
                files.forEach(file => {
                    const index = fs.indexOf(file.filename);
                    if (index > -1) fs.splice(index, 1);
                    table_files.push({file_id: file.file_id, filename: file.filename, exists: (index !== -1)});
                });
                fs.forEach(file => table_files.push({filename: file, exists: 'Yes'}));
                table_files.forEach(file => {
                    let row = tbl_files.insertRow(-1);
                    add_cell(row, {text: file.file_id || ''});
                    add_cell(row, {text: file.filename, classes: ['text-start']});
                    add_cell(row, (file.exists ? {html: _check()} : null))
                    add_cell(row, {
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
addReloadListener(getFiles);