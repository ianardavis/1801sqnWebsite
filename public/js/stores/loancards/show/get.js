let statuses = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3": "Closed"};
function getLoancard() {
    get(
        function (loancard, options) {
            set_innerText({id: 'user_loancard',      text: print_user(loancard.user_loancard)});
            set_innerText({id: 'user',               text: print_user(loancard.user)});
            set_attribute({id: 'user_loancard_link', attribute: 'href', value: `/stores/users/${loancard.user_id_loancard}`});
            set_attribute({id: 'user_link',          attribute: 'href', value: `/stores/users/${loancard.user_id}`});
            set_innerText({id: 'createdAt',          text: print_date(loancard.createdAt, true)});
            set_innerText({id: 'updatedAt',          text: print_date(loancard.updatedAt, true)});
            set_innerText({id: '_status',            text: statuses[loancard._status]});
            set_innerText({id: 'file',               text: String(loancard._filename || '') })
            set_breadcrumb({
                text: loancard.loancard_id,
                href: `/stores/loancards/${loancard.loancard_id}`
            });
            set_attribute({id: 'btn_download', attribute: 'disabled', value: true});
            set_attribute({id: 'btn_raise',    attribute: 'disabled', value: true});
            if (loancard._status === 2) {
                if (!loancard._filename && loancard._filename !== '') {
                    remove_attribute({id: 'btn_raise',    attribute: 'disabled'});
                } else {
                    remove_attribute({id: 'btn_download', attribute: 'disabled'});
                };
            } else if (loancard._status === 3 && loancard._filename && loancard._filename !== '') {
                remove_attribute({id: 'btn_download', attribute: 'disabled'});
            };
        },
        {
            table: 'loancard',
            query: [`loancard_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getLoancard);
window.addEventListener('load', function () {
    let btn_download = document.querySelector('#btn_download')
    if (btn_download) btn_download.addEventListener('click', function () {download('loancards', path[3])})
});