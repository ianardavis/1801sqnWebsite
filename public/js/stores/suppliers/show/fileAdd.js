window.addEventListener("load", function () {
    addFormListener(
        'form_file_add',
        'POST',
        '/stores/files',
        {onComplete: getSupplier}
    );
});