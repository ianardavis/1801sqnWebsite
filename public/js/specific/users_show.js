function getRequests(user_id) {
    let spn_requests = document.querySelector('#spn_requests');
    spn_requests.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#requestTable'),
            request_count = document.querySelector('#request_count');
        if (response.lines) request_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.dataset.sort = new Date(line.request._date).getTime();
                cell1.innerText = new Date(line.request._date).toDateString();
                cell2.innerText = line.size.item._description;
                cell3.innerText = line.size._size;
                cell4.innerText = line._qty;
                cell5.innerText = line._status;
                cell6.appendChild(link('/stores/requests/' + line.request_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_requests.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting requests'));
    let sel_requests = document.querySelector('#sel_requests'),
        query = [];
        if (sel_requests.value !== 'All') query.push('_status=' + sel_requests.value);
    XHR.open('GET', '/stores/getrequestlinesbyuser/' + user_id + '?' + query.join('&'));
    XHR.send();
};
function getOrders(user_id) {
    let spn_orders = document.querySelector('#spn_orders');
    spn_orders.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#orderTable'),
            order_count = document.querySelector('#order_count');
        if (response.lines) order_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1),
                    cell7 = row.insertCell(-1),
                    cell8 = row.insertCell(-1),
                    cell9 = row.insertCell(-1);
                cell1.dataset.sort = new Date(line.order._date).getTime();
                cell1.innerText = new Date(line.order._date).toDateString();
                cell2.innerText = line.size.item._description;
                cell3.innerText = line.size._size;
                cell4.innerText = line._qty;
                cell5.innerText = line._status;
                //////////////////
                if (line.demand_line_id) cell6.appendChild(link('/stores/demands/' + line.demand_line_id, false))
                //////////////////
                cell9.appendChild(link('/stores/orders/' + line.order_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_orders.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting orders'));
    let sel_orders = document.querySelector('#sel_orders'),
        query = [];
    if (sel_orders.value !== 'All') query.push('_status=' + sel_orders.value);
    XHR.open('GET', '/stores/getorderlinesbyuser/' + user_id + '?' + query.join('&'));
    XHR.send();
};
function getIssues(user_id) {
    let spn_issues = document.querySelector('#spn_issues');
    spn_issues.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response    = JSON.parse(event.target.responseText),
            table_body  = document.querySelector('#issueTable'),
            issue_count = document.querySelector('#issue_count');
        if (response.lines) issue_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row   = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.dataset.sort = new Date(line.issue._date).getTime();
                cell1.innerText = new Date(line.issue._date).toDateString();
                cell2.innerText = line.size.item._description;
                cell3.innerText = line.size._size;
                cell4.innerText = line._qty;
                cell5.innerText = 'location';
                cell6.appendChild(link('/stores/issues/' + line.issue_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_issues.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting issues'));
    let sel_issues = document.querySelector('#sel_issues'),
        query = [];
    // if (sel_issues.value !== 'All') query.push('_status=' + sel_issues.value);
    XHR.open('GET', '/stores/getissuelinesbyuser/' + user_id + '?' + query.join('&'));
    XHR.send();
};