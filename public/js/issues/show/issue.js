showIssue = (issues, options) => {
    if (issues.length === 1) {
        for (let [id, value] of Object.entries(issues[0])) {
            try {
                let element = document.querySelector(`#${id}`);
                if (id === 'user_to' || id === 'user_by')  {
                    element.innerText = print_user(value);
                    let link = document.querySelector(`#${id}_link`);
                    link.setAttribute('href', `/stores/users/${value.user_id}`);
                } else if (id === 'createdAt' || id === 'updatedAt' || id === '_date_due') {
                    element.innerText = print_date(value, (id !== '_date_due'));
                } else if (id === '_status') {
                    if      (value === 0) element.innerText = 'Cancelled'
                    else if (value === 1) element.innerText = 'Draft';
                    else if (value === 2) element.innerText = 'Open'
                    else if (value === 3) element.innerText = 'Closed'
                    else element.innerText = 'Unknown';
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = issues[0].issue_id;
        breadcrumb.href = `/stores/issues/${issues[0].issue_id}`;

        ['action', 'complete', 'cancel', 'addSize', 'delete', 'loancard'].forEach(e => {
            document.querySelector(`#btn_${e}`).setAttribute('disabled', true);
        });
        if (issues[0]._status === 0) {
        } else if (issues[0]._status === 1) {
            if (options.permissions.edit) {
                document.querySelector('#btn_complete').removeAttribute('disabled');
                document.querySelector('#btn_cancel').removeAttribute('disabled');
            };
            if (options.permissions.line_add) {
                document.querySelector('#div_modals').appendChild(new Modal({id: 'add_size', static: true}).e);
                document.querySelector('#btn_addSize').removeAttribute('disabled');
                add_size_modal('issue');
            };
            if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
        } else if (issues[0]._status === 2 || issues[0]._status === 3) {
            let btn_loancard = document.querySelector('#btn_loancard');
            if (btn_loancard) {
                btn_loancard.removeAttribute('disabled');
                btn_loancard.setAttribute('href', `javascript:download_file("${issues[0]._filename}")`);
            };
            if (issues[0]._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
        };
    } else alert(`${issues.length} matching issues found`);
};