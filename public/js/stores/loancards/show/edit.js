function setCompleteButton(status) {
    if (status === 1) enable_button('loancard_complete');
};
function editLoancardDueDate() {
    get({
        table: 'loancard',
        where: {loancard_id: path[2]}
    })
    .then(function ([loancard, options]) {
        set_attribute('date_due_edit', 'value', returnDate(loancard.date_due));
        set_attribute('date_due_edit', 'min',   returnDate(loancard.createdAt));
    });
};
function completeLoancardDueDate() {
    set_attribute('date_due_complete', 'value', dateToday(7));
    set_attribute('date_due_complete', 'min',   dateToday());
};
window.addEventListener( "load", function () {
    modalOnShow('due_edit',          editLoancardDueDate);
    modalOnShow('loancard_complete', completeLoancardDueDate);
    addFormListener(
        'due_edit',
        'PUT',
        `/loancards/${path[2]}`,
        {
            onComplete: [
                getLoancard,
                function () {modalHide('due_edit')}
            ]
        }
    );
    addFormListener(
        'complete',
        'PUT',
        `/loancards/${path[2]}/complete`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
    addFormListener(
        'loancard_file_delete',
        'DELETE',
        `/loancards/${path[2]}/delete_file`,
        {onComplete: [getLoancard]}
    );
});