const statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getLoancard() {
    function set_status_badges(status) {
        clear_statuses(3, statuses);
        if ([0, 1, 2, 3].includes(status)) {
            if (status === 0) {
                set_badge(1, 'danger', 'Cancelled');

            } else {
                set_badge(1, 'success');
                if (status > 1) {
                    set_badge(2, 'success');
                };
                if (status > 2) {
                    set_badge(3, 'success');
                };
            };
        };
    };
    function disable_all_buttons() {
        [
            'loancard_complete',
            'delete',
            'download',
            'print',
            'loancard_file_print',
            'loancard_file_download',
            'loancard_file_delete',
            'loancard_date_due_edit'
        ].forEach(button => disable_button(button));
    };

    disable_all_buttons();
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

        set_status_badges(loancard.status);
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