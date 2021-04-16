showIssues = (lines, options) => {
    try {
        clearElement('issueTable');
        let table_body  = document.querySelector('#issueTable'),
            issue_count = document.querySelector('#issue_count');
        issue_count.innerText = lines.length || '0';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            add_cell(row, table_date(line.issue.createdAt));
            add_cell(row, {text: line.issue._to.rank._rank + ' ' + line.issue._to.full_name});
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new Link({
                href: '/issues/' + line.issue_id,
                small: true
            }).e});
        });
        hide_spinner('issue_lines');
    } catch (error) {
        console.log(error);
    };
};