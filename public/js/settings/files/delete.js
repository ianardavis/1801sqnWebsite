function addFileDeleteBtns() {
    document.querySelectorAll('.files').forEach(e => {
        e.appendChild(
            new Delete_Button({
                descriptor: 'file',
                small: true,
                path: (e.dataset.file ? `/fs_files/${e.dataset.file}` : `/files/${e.dataset.id}`)
            }).e
        );
    });
};