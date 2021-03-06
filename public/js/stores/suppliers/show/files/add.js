function getFileDescriptions() {
    clear('file_descriptions')
    .then(list => {
        get({
            table: 'settings',
            query: ['name=file_description']
        })
        .then(function ([descriptions, options]) {
            descriptions.forEach(description => {
                list.appendChild(new Option({value: description.value}).e);
            });
        });
    });
};
window.addEventListener("load", function () {
    modalOnShow('file_add', getFileDescriptions);
    enable_button('file_add');
    addFormListener(
        'file_add',
        'POST',
        '/files',
        {onComplete: getFiles}
    );
});