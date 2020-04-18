function getLines(demand_id, complete, closed, delete_permission) {
    let spn_demands = document.querySelector('#spn_demands');
    spn_demands.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#demandTable'),
            line_count = document.querySelector('#line_count');
        if (response.lines) line_count.innerText = response.lines.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.lines.forEach(line => {
                let row = table_body.insertRow(-1);
                if (complete && !closed) {
                    let cell1 = row.insertCell(-1);
                    cell1.appendChild(checkbox({id: line.line_id}));
                };
                let cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);

                cell2.innerText = line.size.item._description;
                cell2.appendChild(link('/stores/items/' + line.size.item_id));
                
                cell3.innerText = line.size._size;
                cell3.appendChild(link('/stores/sizes/' + line.size.size_id));

                cell4.innerText = line._qty;
                cell5.innerText = line._status

                if (delete_permission) {
                    let cell6 = row.insertCell(-1);
                    if (line._status === 'Pending') {
                        cell6.appendChild(deleteBtn('/stores/demand_lines/' + line.line_id));
                    };
                };
            });
        } else alert('Error: ' + response.error)
        spn_demands.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting lines'));
    let sel_status = document.querySelector('#sel_status'),
        query      = ['demand_id=' + demand_id];
    if (sel_status.value !== 'All') query.push('_status=' + sel_status.value);
    XHR.open('GET', '/stores/getdemandlines?' + query.join('&'));
    XHR.send();
};