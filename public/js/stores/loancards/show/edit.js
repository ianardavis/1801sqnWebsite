function setCompleteButton(status) {
    if (status === 1) enable_button('complete');
};
function editLoancardDueDate() {
    get({
        table: 'loancard',
        query: [`loancard_id=${path[2]}`]
    })
    .then(function ([loancard, options]) {
        let current_date = new Date(loancard.date_due),
            created_date = new Date(loancard.createdAt);
        set_attribute({id: 'date_due_edit', attribute: 'value', value: `${current_date.getFullYear()}-${String(current_date.getMonth() + 1).padStart(2, '0')}-${String(current_date.getDate()).padStart(2, '0')}`});
        set_attribute({id: 'date_due_edit', attribute: 'min',   value: `${created_date.getFullYear()}-${String(created_date.getMonth() + 1).padStart(2, '0')}-${String(created_date.getDate()).padStart(2, '0')}`});
    });
};
function completeLoancardDueDate() {
    get({
        table: 'loancard',
        query: [`loancard_id=${path[2]}`]
    })
    .then(function ([loancard, options]) {
        let current_date = new Date(loancard.date_due),
            created_date = new Date(loancard.createdAt);
        set_attribute({id: 'date_due_complete', attribute: 'value', value: `${current_date.getFullYear() + 7}-${String(current_date.getMonth() + 1).padStart(2, '0')}-${String(current_date.getDate()).padStart(2, '0')}`});
        set_attribute({id: 'date_due_complete', attribute: 'min',   value: `${created_date.getFullYear()}-${String(created_date.getMonth() + 1).padStart(2, '0')}-${String(created_date.getDate()).padStart(2, '0')}`});
    });
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