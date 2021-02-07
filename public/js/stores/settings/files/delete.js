function addFileDeleteBtns() {
    document.querySelectorAll('.files').forEach(e => {
        if (e.dataset.file) {
            e.appendChild(
                new Delete_Button({
                    descriptor: 'file',
                    small: true,
                    path: `/stores/fs_files/${e.dataset.file}`
                }).e
            );
        } else if (e.dataset.id) {
            e.appendChild(
                new Delete_Button({
                    descriptor: 'file',
                    small: true,
                    path: `/stores/files/${e.dataset.id}`
                }).e
            );
        };
    });
};