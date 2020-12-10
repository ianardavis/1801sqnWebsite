function getIssues() {
    get(
        function (lines, options) {
            try {
                clearElement('tbl_issues');
                let table_body = document.querySelector('#tbl_issues');
                set_count({id: 'issue', count: lines.length})
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: print_date(line.issue.createdAt),
                        text: new Date(line.issue.createdAt).toDateString()
                    });
                    add_cell(row, {text: print_user(line.issue._to)});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {append: new Link({
                        href: `/stores/issues/${line.issue_id}`,
                        small: true
                    }).e});
                });
            } catch (error) {
                console.log(error);
            };
        },
        {
            table: 'issue_lines',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getIssues);