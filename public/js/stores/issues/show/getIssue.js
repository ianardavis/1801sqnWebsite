function getIssue() {
    let statuses = {'0': 'Cancelled', '1': 'Draft', '2': 'Open', '3': 'Closed'};
    get(
        function (issue, options) {
            for (let [id, value] of Object.entries(issue)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === 'user_issue' || id === 'user')  {
                        element.innerText = print_user(value);
                        let link = document.querySelector(`#${id}_link`);
                        link.setAttribute('href', `/stores/users/${value.user_id}`);
                    } else if (id === 'createdAt' || id === 'updatedAt' || id === '_date_due') {
                        element.innerText = print_date(value, (id !== '_date_due'));
                    } else if (id === '_status') {
                        element.innerText = statuses[value] || 'Unknown';
                    };
                } catch (error) {console.log(error)};
            };
            let breadcrumb = document.querySelector('#breadcrumb');
            breadcrumb.innerText = issue.issue_id;
            breadcrumb.href = `/stores/issues/${issue.issue_id}`;
    
            ['action', 'complete', 'addSize', 'delete', 'loancard'].forEach(e => {
                document.querySelector(`#btn_${e}`).setAttribute('disabled', true);
            });
            if (issue._status === 0) {
            } else if (issue._status === 1) {
                if (options.permissions.edit) {
                    document.querySelector('#btn_complete').removeAttribute('disabled');
                };
                if (options.permissions.line_add) {
                    document.querySelector('#div_modals').appendChild(new Modal({id: 'add_size', static: true}).e);
                    document.querySelector('#btn_addSize').removeAttribute('disabled');
                    add_size_modal('issue');
                };
                if (options.permissions.delete) document.querySelector('#btn_delete').removeAttribute('disabled');
            } else if (issue._status === 2 || issue._status === 3) {
                let btn_loancard = document.querySelector('#btn_loancard');
                if (btn_loancard) {
                    btn_loancard.removeAttribute('disabled');
                    btn_loancard.setAttribute('href', `javascript:download_file("${issue._filename}")`);
                };
                if (issue._status === 2) document.querySelector('#btn_action').removeAttribute('disabled');
            };
        },
        {
            table: 'issue',
            query: [`issue_id=${path[3]}`],
            permissions: {
                edit: 	     <%= permissions.issue_edit  	   || false %>,
                delete:		 <%= permissions.issue_delete	   || false %>,
                line_add:	 <%= permissions.issue_line_add	   || false %>,
                line_delete: <%= permissions.issue_line_delete || false %>
            }
        }
    );
};
document.querySelector('#reload').addEventListener('click', () => getIssue());