function sortTable(n, tableName) {
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
function removeID(id) {
    if (typeof(id) === 'string') document.querySelector('#' + id).remove();
    else id.remove();
};
function clearElement(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.innerHTML = '';
};
function yesno(boolean) {
    if (boolean === 1 || boolean === true) return 'Yes'
    else return 'No'
};
function enable_button(id) {
    let button = document.querySelector(`#btn_${id}`);
    if (button) button.removeAttribute('disabled');
};
function disable_button(id) {
    let button = document.querySelector(`#btn_${id}`);
    if (button) button.setAttribute('disabled', true);
};
function set_count(options = {}) {
    let _count = document.querySelector(`#${options.id}_count`);
    if (_count) _count.innerText = options.count || '0';
};
function add_cell(row, options = {}) {
    let cell = row.insertCell();
    if (options.sort)      cell.setAttribute('data-sort', options.sort);
    if (options.text)      cell.innerText = options.text || '';
    else if (options.html) cell.innerHTML = options.html || '';
    if (options.classes)   options.classes.forEach(e => cell.classList.add(e));
    if (options.append)    cell.appendChild(options.append);
    if (options.id)        cell.setAttribute('id', options.id);
    if (options.data)      cell.setAttribute(`data-${options.data.field}`, options.data.value)
    if (options.ellipsis)  cell.classList.add('ellipsis1');
};
function show(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.classList.remove('hidden');
};
function hide(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.classList.add('hidden');
};
function set_innerText(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) element.innerText = options.text || '';
};
function set_attribute(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) element.setAttribute(options.attribute || '', options.value || '');
};
function set_breadcrumb(options = {}) {
    let breadcrumb = document.querySelector('#breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerText = options.text || '';
        breadcrumb.setAttribute('href', options.href || '');
    };
};
function set_value(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element && options.value) element.value = options.value;
};
function remove_attribute(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element && options.attribute) element.removeAttribute(options.attribute);
};
function add_class(options) {
    let e = document.querySelector(`#${options.id}`);
    if (e && options.class) e.classList.add(options.class);
};
function remove_class(options) {
    let e = document.querySelector(`#${options.id}`);
    if (e && options.class) e.classList.remove(options.class);
};
function print_user (user) {
    if (user) return `${user.rank._rank } ${user.full_name}`
    else return '';
};
function print_date (date, time = false) {
    if (date) {
        let str = new Date(date).toDateString();
        if (time) str += ` ${new Date(date).toLocaleTimeString()}`;
        return str
    } else return '';
};
function table_date (date, time = false) {
    let _date = {
        sort: new Date(date).getTime(),
        text: print_date(date, time)
    };
    return _date;
}
function print_nsn (nsn) {
    if (nsn && nsn.group && nsn.classification && nsn.country) {
        return `${String(nsn.group._code).padStart(2, '0')}${String(nsn.classification._code).padStart(2, '0')}-${String(nsn.country._code).padStart(2, '0')}-${nsn._item_number}`
    } else return '';
};
function print_account (account) {
    if (account) {
        return `${account._name} | ${account._number}`
    } else return '';
};
let path = window.location.pathname.toString().split('/');