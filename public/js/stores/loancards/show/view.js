let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getLoancard() {
    disable_button('complete');
    disable_button('delete');
    get({
        table: 'loancard',
        query: [`loancard_id=${path[2]}`]
    })
    .then(function ([loancard, options]) {
        set_breadcrumb({text: loancard.loancard_id});
        set_innerText({id: 'loancard_user_loancard', text: print_user(loancard.user_loancard)});
        set_innerText({id: 'loancard_user',          text: print_user(loancard.user)});
        set_innerText({id: 'loancard_createdAt',     text: print_date(loancard.createdAt, true)});
        set_innerText({id: 'loancard_updatedAt',     text: print_date(loancard.updatedAt, true)});
        set_innerText({id: 'loancard_status',        text: statuses[loancard.status]});
        set_innerText({id: 'loancard_filename',      text: String(loancard.filename || '') })
        set_href({id: 'loancard_user_loancard_link', value: `/users/${loancard.user_id_loancard}`});
        set_href({id: 'loancard_user_link',          value: `/users/${loancard.user_id}`});
        disable_button('download');
        if (loancard.filename && loancard.filename !== '') enable_button('download');
        return loancard;
    })
    .then(loancard => {
        if (typeof setButtons      === 'function') setButtons(loancard.status);
        if (typeof setActionButton === 'function') setActionButton(loancard.status);
    });
};
addReloadListener(getLoancard);
window.addEventListener('load', function () {
    addListener('btn_download', function () {download('loancards', path[2])});
});