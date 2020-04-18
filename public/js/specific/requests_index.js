function getRequests() {
    let spn_requests = document.querySelector('#spn_requests');
    spn_requests.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#requestTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.requests.forEach(request => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1),
                    cell6 = row.insertCell(-1);
                cell1.innerText = request._for.rank._rank + ' ' + request._for._name + ', ' + request._for._ini;
                cell2.dataset.sort = new Date(request._date).getTime();
                cell2.innerText    = new Date(request._date).toDateString();
                cell3.innerText    = request.lines.length;
                if (request._complete) cell4.innerHTML = _check();
                if (request._closed)   cell5.innerHTML = _check();
                cell6.appendChild(link('/stores/requests/' + request.request_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_requests.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting requests'));
    let sel_closed   = document.querySelector('#sel_closed'),
        sel_complete = document.querySelector('#sel_complete'),
        query        = [];
    if      (Number(sel_complete.value) === 2) query.push('_complete=0')
    else if (Number(sel_complete.value) === 3) query.push('_complete=1');
    if      (Number(sel_closed.value) === 2)   query.push('_closed=0')
    else if (Number(sel_closed.value) === 3)   query.push('_closed=1');
    XHR.open('GET', '/stores/getrequests?' + query.join('&'));
    XHR.send();
};