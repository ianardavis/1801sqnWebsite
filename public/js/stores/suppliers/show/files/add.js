function getFileDescriptions() {
    clear('file_descriptions')
    .then(list => {
        get({
            table: 'settings',
            where: {name: 'file_description'}
        })
        .then(function ([descriptions, options]) {
            descriptions.forEach(description => {
                list.appendChild(new Option({value: description.value}).e);
            });
        });
    });
};
function reset_FileAdd() {
    setValue('file_upload');
    setValue('file_description_add');
};
window.addEventListener("load", function () {
    modalOnShow('file_add', getFileDescriptions);
    enableButton('file_add');
    addFormListener(
        'file_add',
        'POST',
        '/files',
        {onComplete: [
            getFiles,
            reset_FileAdd
        ]}
    );
});