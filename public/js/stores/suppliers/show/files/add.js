window.addEventListener("load", function () {
    addFormListener(
        'file_add',
        'POST',
        '/files',
        {onComplete: getFiles}
    );
});