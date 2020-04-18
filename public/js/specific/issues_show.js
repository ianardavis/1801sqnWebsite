function getLines(issue_id, return_permission, delete_permission) {
    let spn_issues = document.querySelector('#spn_issues');
    spn_issues.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#issueTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1),
                    cell7 = row.insertCell(-1),
                    cell8 = row.insertCell(-1),
                    cell9 = row.insertCell(-1);
                cell1.innerText = String(line._line).padStart(2, '0');

                if (line.nsn)    cell2.innerText = line.nsn._nsn;
                if (line.nsn)    cell2.appendChild(link('javascript:show("nsns",' + line.nsn_id + ',{"height":200})'));
                if (line.serial) cell3.innerText = line.serial._serial;
                if (line.serial) cell3.appendChild(link('javascript:show("serials",' + line.serial_id + ',{"height":200})'));
                
                if (line.stock && line.stock.size && line.stock.size.item) {
                    cell4.innerText = line.stock.size.item._description;
                    cell5.appendChild(link('/stores/items/' + line.stock.size.item_id));
                } else cell4.innerText = '?';

                if (line.stock && line.stock.size) {
                    cell5.innerText = line.stock.size._size;
                    cell5.appendChild(link('/stores/sizes/' + line.stock.size_id));
                } else cell5.innerText = '?';

                cell6.innerText = line._qty;

                if (line.stock) {
                    cell7.innerText = line.stock.location._location;
                    cell7.appendChild(link('/stores/stock/' + line.stock_id + '/edit'));
                } else cell7.innerText = '?';

                if (line.return) {
                    cell8.innerText = line.return.stock.location._location;
                    cell8.appendChild(link('/stores/stock/' + line.return.stock_id + '/edit'));
                } else if (return_permission) {
                    cell8.innerText = '***Return select***';
                    // <select class='form-control form-control-sm' name='returnLines[]'>
                    //     <option value='' selected></option>
                    //     if (line.stock && line.stock.size && line.stock.size.stocks) line.stock.size.stocks.forEach(stock => {
                    //         <option value='{"line_id":<%= line.line_id,"qty":<%= line._qty,"stock_id":<%= stock.stock_id,"issue_id":<%= issue.issue_id}'><%= stock.location._location</option>
                    //     });
                    // </select>
                };

                if (line.return) cell9.innerText = line.return.return._date.toDateString();

                if (delete_permission) {
                    let cell10 = row.insertCell(-1);
                    if (line._status === 'Pending') {
                        cell10.appendChild(deleteBtn('/stores/issue_lines/' + line.line_id));
                    };
                };
            });
        } else alert('Error: ' + response.error)
        spn_issues.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let query = ['issue_id=' + issue_id];
    XHR.open('GET', '/stores/getissuelines?' + query.join('&'));
    XHR.send();
};