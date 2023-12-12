function addFileDeleteBtns() {
    document.querySelectorAll('.files').forEach(e => {
        e.appendChild(
            new Delete_Button({
                descriptor: 'file',
                path: (e.dataset.file ? `/fs_files/${e.dataset.file}` : `/files/${e.dataset.id}`),
                small: true
            }).e
        );
    });
};