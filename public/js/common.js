sortTable = (n, tableName) => {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(tableName);
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].querySelectorAll("td")[n].dataset.sort || rows[i].querySelectorAll("td")[n].innerText.toLowerCase();
            y = rows[i + 1].querySelectorAll("td")[n].dataset.sort || rows[i + 1].querySelectorAll("td")[n].innerText.toLowerCase();
            if (dir == "asc") {
                if (x > y) {
                    shouldSwitch = true;
                    break;
                };
            } else if (dir == "desc") {
                if (x < y) {
                    shouldSwitch = true;
                    break;
                };
            };
        };
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            };
        };
    };
};

removeID = id => {
    if (typeof(id) === 'string') document.querySelector('#' + id).remove();
    else id.remove();
};

let path = window.location.pathname.toString().split('/');

alert = message => {
    if (window.opener) {
        window.opener.alert(message);
    } else {
        let notification = document.querySelector('#alert');
        if (notification) {
            notification.setAttribute('data-content', message);
            let _date = new Date();
            notification.setAttribute('data-original-title', _date.toLocaleDateString() + ' ' + _date.toLocaleTimeString());
            $('#alert').popover('show');
            setTimeout(() => {$('#alert').popover('hide')}, 5000);
        };
    };
};