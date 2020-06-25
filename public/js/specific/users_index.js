function getUsers() {
    let spn_users = document.querySelector('#spn_users');
    spn_users.style.display = 'block';
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response   = JSON.parse(event.target.responseText),
            table_body = document.querySelector('#userTable');
        table_body.innerHTML = '';
        if (response.result) {
            response.users.forEach(user => {
                let row = table_body.insertRow(-1),
                    cell1 = row.insertCell(-1),
                    cell2 = row.insertCell(-1),
                    cell3 = row.insertCell(-1),
                    cell4 = row.insertCell(-1),
                    cell5 = row.insertCell(-1);
                cell1.innerText = user._bader;
                cell2.innerText = user.rank._rank;
                cell3.innerText = user._name;
                cell4.innerText = user._ini;
                cell5.appendChild(link('/stores/users/' + user.user_id, false))
            });
        } else alert('Error: ' + response.error)
        spn_users.style.display = 'none';
    });
    XHR.addEventListener("error", event => alert('Oops! Something went wrong getting userss'));
    let sel_status = document.querySelector('#sel_status'),
        query      = [];
    query.push('status_id=' +   sel_status.value);
    XHR.open('GET', '/stores/get/users?' + query.join('&'));
    XHR.send();
};