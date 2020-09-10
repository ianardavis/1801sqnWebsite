showIssues = (lines, options) => {
    let table_body  = document.querySelector('#issueTable'),
        issue_count = document.querySelector('#issue_count');
    if (lines) issue_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(line.issue._date).getTime(),
            text: new Date(line.issue._date).toDateString()
        });
        if (line.size) {
            add_cell(row, {
                text: line.size.item._description,
                append: new Link({
                    href: '/stores/items/' + line.size.item_id,
                    small: true,
                    float: true
                }).link
            });
            add_cell(row, {
                text: line.size._size,
                append: new Link({
                    href: '/stores/sizes/' + line.size.size_id,
                    small: true,
                    float: true
                }).link
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
                    name: 'returns[line_id' + line.line_id + '][stock_id]',
                    small: true,
                    options: options
                }).select
            });
        } else add_cell(row);
        
        add_cell(row, {
            append: new Link({
                href: '/stores/issues/' + line.issue_id,
                small: true
            }).link
        });
    });
    hide_spinner('issue_lines');
};