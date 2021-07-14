let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getLoancard() {
    disable_button('complete');
    disable_button('delete');
    disable_button('download');
    get({
        table: 'loancard',
        query: [`loancard_id=${path[2]}`]
    })
    .then(function ([loancard, options]) {
        set_breadcrumb({text: `${print_user(loancard.user_loancard)} | ${print_date(loancard.createdAt)}`});
        set_innerText({id: 'loancard_user_loancard', text: print_user(loancard.user_loancard)});
        set_innerText({id: 'loancard_user',          text: print_user(loancard.user)});
        set_innerText({id: 'loancard_createdAt',     text: print_date(loancard.createdAt, true)});
        set_innerText({id: 'loancard_date_due',     text: print_date(loancard.date_due)});
        set_innerText({id: 'loancard_updatedAt',     text: print_date(loancard.updatedAt, true)});
        set_innerText({id: 'loancard_status',        text: statuses[loancard.status]});
        set_innerText({id: 'loancard_filename',      text: loancard.filename || ''})
        set_href({id: 'loancard_user_loancard_link', value: `/users/${loancard.user_id_loancard}`});
        set_href({id: 'loancard_user_link',          value: `/users/${loancard.user_id}`});
        if ((loancard.filename && loancard.filename !== '') || loancard.status >= 2) {
            enable_button('print');
            enable_button('download');
            set_attribute({id: 'form_download', attribute: 'method', value: 'GET'});
            set_attribute({id: 'form_download', attribute: 'action', value: `/loancards/${loancard.loancard_id}/download`});
        } else {
            remove_attribute({id: 'form_download', attribute: 'method'});
            remove_attribute({id: 'form_download', attribute: 'action'});
        };
        if ((loancard.filename && loancard.filename !== '')) enable_button('print');
        else disable_button('print');
        return loancard.status;
    })
    .then(status => {
        if (typeof setDeleteButton   === 'function') setDeleteButton(status);
        if (typeof setCompleteButton === 'function') setCompleteButton(status);
        if (typeof setActionButton   === 'function') setActionButton(status);
    });
};
addReloadListener(getLoancard);
window.addEventListener('load', function () {
    addFormListener(
        'print',
        'GET',
        `/loancards/${path[2]}/print`
    );
});