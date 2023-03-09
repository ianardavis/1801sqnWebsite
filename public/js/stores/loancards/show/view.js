let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getLoancard() {
    disable_button('loancard_complete');
    disable_button('delete');
    disable_button('download');
    disable_button('print');
    disable_button('loancard_file_print');
    disable_button('loancard_file_download');
    disable_button('loancard_file_delete');
    disable_button('loancard_date_due_edit');
    get({
        table: 'loancard',
        where: {loancard_id: path[2]}
    })
    .then(function ([loancard, options]) {
        set_breadcrumb(`${print_user(loancard.user_loancard)} | ${print_date(loancard.createdAt)}`);
        set_innerText('loancard_user_loancard', print_user(loancard.user_loancard));
        set_innerText('loancard_user',          print_user(loancard.user));
        set_innerText('loancard_createdAt',     print_date(loancard.createdAt, true));
        set_innerText('loancard_date_due',      print_date(loancard.date_due));
        set_innerText('loancard_updatedAt',     print_date(loancard.updatedAt, true));
        set_innerText('loancard_status',        statuses[loancard.status]);
        set_innerText('loancard_filename',      loancard.filename || '')
        set_href('loancard_user_loancard_link', `/users/${loancard.user_id_loancard}`);
        set_href('loancard_user_link',          `/users/${loancard.user_id}`);
        if (loancard.status >= 2) {
            enable_button('print');
            enable_button('download');
            enable_button('loancard_file_print');
            enable_button('loancard_file_download');
            if (loancard.filename) enable_button('loancard_file_delete');
            enable_button('loancard_date_due_edit', '');
            set_attribute('form_loancard_file_download', 'method', 'GET');
            set_attribute('form_loancard_file_download', 'action', `/loancards/${loancard.loancard_id}/download`);
        } else {
            set_attribute('form_loancard_file_download', 'method');
            set_attribute('form_loancard_file_download', 'action');
        };
        return loancard.status;
    })
    .then(status => {
        if (typeof setDeleteButton   === 'function') setDeleteButton(  status);
        if (typeof setCompleteButton === 'function') setCompleteButton(status);
        if (typeof setActionButton   === 'function') setActionButton(  status);
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getLoancard);
    addFormListener(
        'loancard_file_print',
        'GET',
        `/loancards/${path[2]}/print`
    );
    getLoancard();
});