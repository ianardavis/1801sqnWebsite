function getSizes(item_id) {
    let spn_items = document.querySelector('#spn_items');
    spn_items.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#sizeTable'),
            size_count = document.querySelector('#size_count');
        if (response.sizes) size_count.innerText = response.sizes.length || '0';
        table_body.innerHTML = '';
        if (response.result) {
            response.sizes.forEach(size => {
                let row = table_body.insertRow(-1);
                let cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1);
                cell1.innerText = size._size;
                cell2.innerText = size.locationStock;
                cell3.appendChild(link('/stores/sizes/' + size.size_id, false));
            });
        } else alert('Error: ' + response.error)
        spn_items.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting sizes'));
    let query = ['item_id=' + item_id];
    XHR.open('GET', '/stores/get/sizes?' + query.join('&'));
    XHR.send();
};