function getIssues() {
    let spn_issues = document.querySelector('#spn_issues');
    spn_issues.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#issueTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.issues.forEach(issue => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.innerText    = issue._to.rank._rank + ' ' + issue._to._name + ', ' + issue._to._ini
                cell2.dataset.sort = new Date(issue._date).getTime();
                cell2.innerText    = new Date(issue._date).toDateString();
                cell3.innerText    = issue.lines.length;
                if (issue._complete) cell4.innerHTML = _check();
                if (issue._closed)   cell5.innerHTML = _check();
                cell6.appendChild(link('/stores/issues/' + issue.issue_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_issues.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting issues'));
    let sel_closed   = document.querySelector('#sel_closed'),
        sel_complete = document.querySelector('#sel_complete'),
        query        = [];
    if      (Number(sel_complete.value) === 2)  query.push('_complete=0')
    else if (Number(sel_complete.value) === 3)  query.push('_complete=1');
    if      (Number(sel_closed.value) === 2)    query.push('_closed=0')
    else if (Number(sel_closed.value) === 3)    query.push('_closed=1');
    XHR.open('GET', '/stores/get/issues?' + query.join('&'));
    XHR.send();
};