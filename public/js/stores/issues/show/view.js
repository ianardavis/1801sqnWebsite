function showIssue() {
    let statuses = {'0': 'Cancelled', '1': 'Requested', '2': 'Approved', '3': 'Ordered', '4': 'Issued', '5': 'Returned'};
    get(
        {
            table: 'issue',
            query: [`issue_id=${path[3]}`],
            onFail: function () {window.location.href = '/stores/issues'}
        },
        function (issue, options) {
            set_innerText({id: `user_issue`,      text: print_user(issue.user_issue)});
            set_attribute({id: `user_issue_link`, attribute: 'href', value: `/stores/users/${issue.user_id_issue}`});
            set_innerText({id: 'size_desc',       text: issue.size._size});
            set_attribute({id: 'size_desc_link',  attribute: 'href', value: `/stores/sizes/${issue.size_id}`});
            set_innerText({id: 'item_name',       text: issue.size.item._description});
            set_attribute({id: 'item_name_link',  attribute: 'href', value: `/stores/items/${issue.size.item_id}`});
            set_innerText({id: '_qty',            text: issue._qty});
            set_innerText({id: 'createdAt',       text: print_date(issue.createdAt, true)});
            set_innerText({id: 'updatedAt',       text: print_date(issue.updatedAt, true)});
            set_innerText({id: '_status',         text: statuses[issue._status]});
            set_innerText({id: 'user',            text: print_user(issue.user)});
            set_attribute({id: 'user_link',       attribute: 'href', value: `/stores/users/${issue.user_id}`});
            set_breadcrumb({
                text: issue.issue_id,
                href: `/stores/issues/${issue.issue_id}`
            });
        }
    );
};
document.querySelector('#reload').addEventListener('click', showIssue);