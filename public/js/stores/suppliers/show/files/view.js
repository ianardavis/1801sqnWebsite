function getFiles() {
    clear('tbl_files')
    .then(tbl_files => {
        let sort_cols = tbl_files.parentNode.querySelector('.sort') || null;
        get({
            table: 'files',
            query: [`supplier_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([files, options]) {
            set_count({id: 'file', count: files.length || '0'});
            files.forEach(file => {
                let row = tbl_files.insertRow(-1);
                add_cell(row, {text: file.filename})
                add_cell(row, {text: file.description});
                add_cell(row, {
                    append: new Link({
                        modal: 'file_view',
                        data: [{field: 'id', value: file.file_id}],
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
    modalOnShow('file_view', function (event) {viewFile(event.relatedTarget.dataset.id)});
    document.querySelector('#reload').addEventListener('click', getFiles);
});