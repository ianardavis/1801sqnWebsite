showIssues = (issues, options = {}) => {
    clearElement('tbl_issues');
    let table_body = document.querySelector('#tbl_issues');
    issues.forEach(issue => {
        let row = table_body.insertRow(-1);
        add_cell(row, {text: print_user(issue.user_to)});
        add_cell(row, {
            sort: new Date(issue.createdAt).getTime(),
            text: print_date(issue.createdAt)
        });
        add_cell(row, {text: issue.lines.length || '0'});
        if (issue._status === 0) add_cell(row, {text: 'Cancelled'})
        else if (issue._status === 1) add_cell(row, {text: 'Draft'})
        else if (issue._status === 2) add_cell(row, {text: 'Open'})
        else if (issue._status === 3) add_cell(row, {text: 'Complete'});
        add_cell(row, {append: new Link({href: `/stores/issues/${issue.issue_id}`, small: true}).e});
    });
};