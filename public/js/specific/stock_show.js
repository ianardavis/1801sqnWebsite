function getAdjusts(size_id) {
    let spn_adjusts = document.querySelector('#spn_adjusts');
    spn_adjusts.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#adjustTable'),
            adjust_count = document.querySelector('#adjust_count');
        if (response.adjusts) adjust_count.innerText = response.adjusts.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.adjusts.forEach(adjust => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);
                cell1.dataset.sort = new Date(adjust._date).getTime();
                cell1.innerText    = new Date(adjust._date).toDateString();
                cell2.innerText = adjust._type;
                cell3.innerText = adjust._qty;
                cell4.innerText = adjust._variance;
                cell5.innerText = adjust.user.rank._rank + ' ' + adjust.user.full_name;
            });
        } else alert('Error: ' + response.error)
        spn_adjusts.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting adjustments'));
    XHR.open('GET', '/stores/get/adjusts?size_id=' + size_id);
    XHR.send();
};
function getReceipts(size_id) {
    let spn_receipts = document.querySelector('#spn_receipts');
    spn_receipts.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#receiptTable'),
            receipt_count = document.querySelector('#receipt_count');
        if (response.lines) receipt_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1);
                cell1.dataset.sort = new Date(line.receipt._date).getTime();
                cell1.innerText    = new Date(line.receipt._date).toDateString();
                cell2.innerText = line._qty;
                cell3.innerText = line.receipt.user.rank._rank + ' ' + line.receipt.user.full_name;
                cell4.appendChild(link('/stores/receipts/' + line.receipt_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_receipts.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting receipts'));
    XHR.open('GET', '/stores/get/receipt_lines?size_id=' + size_id);
    XHR.send();
};
function getIssues(size_id) {
    let spn_issues = document.querySelector('#spn_issues');
    spn_issues.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#issueTable'),
            issue_count = document.querySelector('#issue_count');
        if (response.lines) issue_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);
                cell1.dataset.sort = new Date(line.issue._date).getTime();
                cell1.innerText    = new Date(line.issue._date).toDateString();
                cell2.innerText = line.issue._to.rank._rank + ' ' + line.issue._to.full_name;
                cell3.innerText = line._qty;
                if (line.return_line_id !== null) cell4.innerHTML = _check();
                cell5.appendChild(link('/stores/issues/' + line.issue_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_issues.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting issues'));
    XHR.open('GET', '/stores/get/issuelines?size_id=' + size_id);
    XHR.send();
};
function getReturns(size_id) {
    let spn_returns = document.querySelector('#spn_returns');
    spn_returns.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText),
            table_body    = document.querySelector('#returnTable'),
            return_count = document.querySelector('#return_count');
        if (response.lines) return_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1);
                cell1.dataset.sort = new Date(line.return._date).getTime();
                cell1.innerText    = new Date(line.return._date).toDateString();
                cell2.innerText = line.return._from.rank._rank + ' ' + line.return._from.full_name;
                cell3.innerText = line._qty;
                cell4.appendChild(link('/stores/returns/' + line.return_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_returns.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting returns'));
    XHR.open('GET', '/stores/get/return_lines?size_id=' + size_id);
    XHR.send();
};