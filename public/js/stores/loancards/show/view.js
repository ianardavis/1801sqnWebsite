const statuses = {
    "0": "Cancelled", 
    "1": "Draft", 
    "2": "Complete", 
    "3": "Closed"
};
function get_loancard() {
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
        ].forEach(button => disableButton(button));
    };
    function display_details([loancard, options]) {
        setBreadcrumb(`${printUser(loancard.user_loancard)} | ${printDate(loancard.createdAt)}`);
        setInnerText('loancard_user_loancard', printUser(loancard.user_loancard));
        setInnerText('loancard_user',          printUser(loancard.user));
        setInnerText('loancard_createdAt',     printDate(loancard.createdAt, true));
        setInnerText('loancard_date_due',      printDate(loancard.date_due));
        setInnerText('loancard_updatedAt',     printDate(loancard.updatedAt, true));
        setInnerText('loancard_filename',      loancard.filename || '');
        return loancard;
    };
    function set_links(loancard) {
        setHREF('loancard_user_loancard_link', `/users/${loancard.user_id_loancard}`);
        setHREF('loancard_user_link',          `/users/${loancard.user_id}`);
        return loancard;
    };
    function set_status_badges(loancard) {
        clearStatuses(3, statuses);
        if ([0, 1, 2, 3].includes(loancard.status)) {
            if (loancard.status === 0) {
                setBadge(1, 'danger', 'Cancelled');

            } else {
                setBadge(1, 'success');
                if (loancard.status > 1) {
                    setBadge(2, 'success');
                };
                if (loancard.status > 2) {
                    setBadge(3, 'success');
                };
            };
        };
        return loancard;
    };
    function set_button_states(loancard) {
        if (loancard.status === 1) {
            if (typeof enable_complete_button === 'function') enable_complete_button();
            if (typeof enable_delete_button   === 'function') enable_delete_button();
        }
        if ([1, 2].includes(Number(loancard.status)) === 1) {
            if (typeof enable_action_button === 'function') enable_action_button();
        }
        if (loancard.status >= 2) {
            enableButton('print');
            enableButton('download');
            enableButton('loancard_file_print');
            enableButton('loancard_file_download');
            if (loancard.filename) enableButton('loancard_file_delete');
            enableButton('loancard_date_due_edit', '');
            setAttribute('form_loancard_file_download', 'method', 'GET');
            setAttribute('form_loancard_file_download', 'action', `/loancards/${loancard.loancard_id}/download`);

        } else {
            setAttribute('form_loancard_file_download', 'method');
            setAttribute('form_loancard_file_download', 'action');

        };
        return loancard;
    };

    disable_all_buttons();
    get({
        table: 'loancard',
        where: {loancard_id: path[2]}
    })
    .then(display_details)
    .then(set_links)
    .then(set_status_badges)
    .then(set_button_states)
};
window.addEventListener('load', function () {
    addListener('reload', get_loancard);
    addFormListener(
        'loancard_file_print',
        'GET',
        `/loancards/${path[2]}/print`
    );
    get_loancard();
});