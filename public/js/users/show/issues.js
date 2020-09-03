showIssues = (lines, options) => {
    let table_body  = document.querySelector('#issueTable'),
        issue_count = document.querySelector('#issue_count');
    if (lines) issue_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row   = table_body.insertRow(-1),
            cell1 = row.insertCell(-1),
            cell2 = row.insertCell(-1),
            cell3 = row.insertCell(-1),
            cell4 = row.insertCell(-1),
            cell5 = row.insertCell(-1),
            cell6 = row.insertCell(-1);
        cell1.dataset.sort = new Date(line.issue._date).getTime();
        cell1.innerText = new Date(line.issue._date).toDateString();
        if (line.size) {
            cell2.innerText = line.size.item._description;
            cell2.append(link('/stores/items/' + line.size.item_id));
            cell3.innerText = line.size._size;
            cell3.append(link('/stores/sizes/' + line.size.size_id));
        };
        cell4.innerText = line._qty;
        if (line.return) {
            cell5.innerText = line.return.stock.location._location;
        } else if (return_permission) {
            let select = _select({
                name: 'returns[line_id' + line.line_id + '][stock_id]'
            });
            select.appendChild(_option('', '... Select Location'))
            line.size.stocks.forEach(stock => {
                select.appendChild(_option(stock.stock_id, stock.location._location))
            });
            cell5.appendChild(select);
        };
        cell6.appendChild(link('/stores/issues/' + line.issue_id, false));
    });
    hide_spinner('issues');
};