function getFiles() {
    let tbl_files = document.querySelector('#tbl_files');
    if (tbl_files) {
        tbl_files.innerHTML = '';
        get(
            {table: 'files'},
            function (files, options) {
                get(
                    {table: 'fs_files'},
                    function (fs, options) {
                        let table_files = [];
                        files.forEach(file => {
                            const index = fs.indexOf(file._filename);
                            if (index > -1) fs.splice(index, 1);
                            table_files.push({file_id: file.file_id, filename: file._filename, exists: (index !== -1)});
                        });
                        fs.forEach(file => table_files.push({filename: file, exists: 'Yes'}));
                        table_files.forEach(file => {
                            let row = tbl_files.insertRow(-1);
                            add_cell(row, {text: file.file_id || ''});
                            add_cell(row, {text: file.filename, classes: ['text-left']});
                            if (file.exists)  add_cell(row, {html: _check()})
                            else              add_cell(row);
                            if (file.file_id) add_cell(row, {classes: ['files'], data: {field: 'id',   value: file.file_id}})
                            else              add_cell(row, {classes: ['files'], data: {field: 'file', value: file.filename}})
                        });
                        if (typeof addFileDeleteBtns === 'function') addFileDeleteBtns();
                    }
                );
            }
        );
    };
};
window.addEventListener('load', function () {
    document.querySelector('#reload').addEventListener('click', getFiles);
});