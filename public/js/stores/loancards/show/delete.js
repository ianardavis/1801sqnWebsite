const enable_delete_button = function () {enableButton('delete')};
window.addEventListener("load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/loancards/${path[2]}`,
        {
            onComplete: [
                get_loancard,
                get_lines
            ]
        }
    );
});