getIssues = () => {
    show_spinner('issues');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#issueTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.issues.forEach(issue => {
                let row = table_body.insertRow(-1);
                add_cell(row, {text: issue._to.rank._rank + ' ' + issue._to.full_name});
                add_cell(row, {
                    text: new Date(issue._date).toDateString(),
                    sort: new Date(issue._date).getTime()
                })
                add_cell(row, {text: issue.lines.length});
                if (issue._complete) add_cell(row, {html: _check()})
                else add_cell(row);
                if (issue._closed)   add_cell(row, {html: _check()})
                else add_cell(row);
                add_cell(row, {append: link('/stores/issues/' + issue.issue_id, false)});
            });
        } else alert('Error: ' + response.error);
        hide_spinner('issues');
    });
    let sel_closed   = document.querySelector('#sel_closed'),
        sel_complete = document.querySelector('#sel_complete'),
        query        = [];
    if      (Number(sel_complete.value) === 2)  query.push('_complete=0')
    else if (Number(sel_complete.value) === 3)  query.push('_complete=1');
    if      (Number(sel_closed.value) === 2)    query.push('_closed=0')
    else if (Number(sel_closed.value) === 3)    query.push('_closed=1');
    XHR_send(XHR, 'issues', '/stores/get/issues?' + query.join('&'));
};