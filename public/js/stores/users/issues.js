function getIssues () {
    let returned_lines = document.querySelector('#returned_lines');
    getByUser(
        function (lines, options) {
            set_count({id: 'issue', count: lines.length || '0'})
            let table_body = document.querySelector('#tbl_issues');
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: new Date(line.createdAt).getTime(),
                        text: print_date(line.createdAt)
                    });
                    if (line.size) {
                        add_cell(row, {
                            text: line.size.item._description,
                            append: new Link({
                                href: `/stores/items/${line.size.item_id}`,
                                small: true,
                                float: true
                            }).e
                        });
                        add_cell(row, {
                            text: line.size._size,
                            append: new Link({
                                href: `/stores/items/${line.size.item_id}`,
                                small: true,
                                float: true
                            }).e
                        });
                    } else {
                        add_cell(row);
                        add_cell(row);
                    };
                    add_cell(row, {text: line._qty});
                    if (line.return) add_cell(row, {text: line.return.stock.location._location});
                    else if (options.return_permission) {
                        let options = [{value: '', text: '... Select Location', selected: true}];
                        line.size.stocks.forEach(stock => {
                            options.push({value: stock.stock_id, text: stock.location._location})
                        });
                        add_cell(row, {
                            append: new Select({
                                name: `returns[line_id${line.line_id}][stock_id]`,
                                small: true,
                                options: options
                            }).e
                        });
                    } else add_cell(row);
                    add_cell(row, {
                        append: new Link({
                            href: `/stores/issues/${line.issue_id}`,
                            small: true
                        }).e
                    });
                });
            };
        },
        {
            table: 'issue_lines',
            user_id: path[3],
            query: [returned_lines.value]
        }
    );
};
function getDraftIssues() {
    get(
        function (issues, options) {
            let crd_draft_issue = document.querySelector('#crd_draft_issue');
            if (crd_draft_issue) {
                if (issues.length > 0) {
                    crd_draft_issue.classList.remove('hidden');
                    set_count({id: 'draft_issue', count: issues.length || 0});
                    let draft_issues = document.querySelector('#draft_issues');
                    if (draft_issues) {
                        draft_issues.innerHTML = '';
                        issues.forEach(e => {
                            draft_issues.appendChild(
                                new P({append: new A({
                                    classes: ['f-10'],
                                    href: `/stores/issues/${e.issue_id}`,
                                    text: `Issue ${e.issue_id}| Started: ${print_date(e.createdAt, true)}`
                                }).e}).e,
                                
                            );
                        });
                    };
                } else crd_draft_issue.classList.add('hidden');
            };
        },
        {
            table: 'issues',
            query: [`user_id_issue=${path[3]}`,'_status=1']
        }
    );
};
document.querySelector('#reload').addEventListener('click', getDraftIssues);
document.querySelector('#reload').addEventListener('click', getIssues);
document.querySelector('#returned_lines').addEventListener('change', getIssues);