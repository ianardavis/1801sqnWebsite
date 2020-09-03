showRequests = (lines, options) => {
    let table_body    = document.querySelector('#requestTable'),
        request_count = document.querySelector('#request_count');
    if (lines) request_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
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
    hide_spinner('requests');
};