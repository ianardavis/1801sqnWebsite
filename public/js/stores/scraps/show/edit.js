function setCompleteButton(status) {
    if (status === 1) enable_button('loancard_complete');
};
function returnDate(_date) {
    let date = new Date(_date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
function dateToday(addYears = 0) {
    let current_date = new Date();
    return `
        ${current_date.getFullYear() + addYears}-
        ${String(current_date.getMonth() + 1).padStart(2, '0')}-
        ${String(current_date.getDate())     .padStart(2, '0')}
    `;
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