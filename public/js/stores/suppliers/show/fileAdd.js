window.addEventListener("load", function () {
    addFormListener(
        'file_add',
        'POST',
        '/stores/files',
        {onComplete: getSupplier}
    );
});