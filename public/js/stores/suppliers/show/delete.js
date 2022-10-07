window.addEventListener("load", function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/suppliers/${path[2]}`
    );
});