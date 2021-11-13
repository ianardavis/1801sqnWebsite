function setCompleteButton(status) {
    if (status === 1) enable_button('complete');
};
function editLoancardDueDate() {
    get({
        table: 'loancard',
        query: [`"loancard_id":"${path[2]}"`]
    })
    .then(function ([loancard, options]) {
        set_attribute({id: 'date_due_edit', attribute: 'value', value: returnDate(loancard.date_due)});
        set_attribute({id: 'date_due_edit', attribute: 'min',   value: returnDate(loancard.createdAt)});
    });
};
function completeLoancardDueDate() {
    set_attribute({id: 'date_due_complete', attribute: 'value', value: dateToday(7)});
    set_attribute({id: 'date_due_complete', attribute: 'min',   value: dateToday()});
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
        'delete_file',
        'DELETE',
        `/loancards/${path[2]}/delete_file`,
        {onComplete: [getLoancard]}
    );
});