function getCount(table, query, options) {
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText);
        if (response.result) {
            if (response[table]) {
                if (response[table].length === 0) options.colour = 'success';
                let badge = document.createElement('span'),
                _count = document.querySelector('#subtitle' + table.substring(0, 1).toUpperCase() + table.substring(1, table.length));
                badge.classList.add('mx-1', 'float-' + options.float, 'badge', 'badge-' + options.colour);
                badge.dataset.toggle = 'tooltip';
                badge.dataset.placement = 'top';
                badge.title = options.text + ' ' + table;
                badge.innerText = response[table].length;
                _count.appendChild(badge);
            };
        } else alert('Error: ' + response.error)
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting '+ table));
    XHR.open('GET', '/stores/get' + table + '?' + query.join('&'));
    XHR.send();
};