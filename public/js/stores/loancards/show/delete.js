function setDeleteButton(status) {
    if (status === 1) enable_button('delete');
};
window.addEventListener("load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/loancards/${path[2]}`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});