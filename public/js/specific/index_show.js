function getRequests() {
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response      = JSON.parse(event.target.responseText);
        if (response.result) {
            if (response.requests && response.requests.length > 0) {
                let badge = document.createElement('span'),
                    request_count = document.querySelector('#titleRequests');
                badge.classList.add('float-right', 'badge', 'badge-danger');
                badge.innerText = response.requests.length;
                request_count.appendChild(badge);
            };
        } else alert('Error: ' + response.error)
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting requests'));
    let query = ['_complete=1', '_closed=0'];
    XHR.open('GET', '/stores/getrequests?' + query.join('&'));
    XHR.send();
};