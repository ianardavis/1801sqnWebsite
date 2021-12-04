function dateToday(addYears = 0) {
    let current_date = new Date();
    return `
        ${current_date.getFullYear() + addYears}-
        ${String(current_date.getMonth() + 1).padStart(2, '0')}-
        ${String(current_date.getDate())     .padStart(2, '0')}
    `;
};
function returnDate(_date) {
    let date = new Date(_date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
function sortTable(n, tableName, obj) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.querySelector(`#${tableName}`);
    switching = true;
    dir = "asc";
    // new Promise(resolve => {
    //     let id = random_id();
    //     add_spinner(obj, {id: id});
    //     resolve(id);
    // })
    // .then(id => {
        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 0; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i]    .querySelectorAll("td")[n].dataset.sort || rows[i]    .querySelectorAll("td")[n].innerText.toLowerCase();
                y = rows[i + 1].querySelectorAll("td")[n].dataset.sort || rows[i + 1].querySelectorAll("td")[n].innerText.toLowerCase();
                if (!isNaN(x)) x = Number(x);
                if (!isNaN(y)) y = Number(y);
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
    //     return id
    // })
    // .then(id => {
    //     // remove_spinner(id);
    //     return id;
    // })
    // .catch(err => {
    //     // remove_spinner(id);
    //     console.log(err)
    // });
};
function sortByRow(col, func) {
    let add_sort = function (_col, dir) {
            _col.classList.add('sort');
            _col.setAttribute('data-sort_dir', dir);
            let sort_ind = _col.querySelector('.sort_ind');
            if (sort_ind) {
                if      (dir === 'ASC')  sort_ind.innerHTML = '<i class="fas fa-sort-up"></i>'
                else if (dir === 'DESC') sort_ind.innerHTML = '<i class="fas fa-sort-down"></i>'
                else sort_ind.innerHTML = '';
            }
        },
        remove_sort = function (_col) {
            _col.classList.remove('sort');
            _col.removeAttribute('data-sort_dir');
            let sort_ind = _col.querySelector('.sort_ind');
            if (sort_ind) sort_ind.innerHTML = '';
        };
    let sortCols = col.parentNode.querySelectorAll('.sort');
    if (sortCols && sortCols.length > 0) {
        sortCols.forEach(e => {
            if (e === col) {
                if      (col.dataset.sort_dir === 'ASC')  add_sort(col, 'DESC');
                else if (col.dataset.sort_dir === 'DESC') remove_sort(col);
            } else {
                remove_sort(e);
                add_sort(col, 'ASC');
            };
        });
    } else add_sort(col, 'ASC');
    func();
}
function removeID(id) {
    if (typeof(id) === 'string') document.querySelector(`#${id}`).remove();
    else id.remove();
};
function clearElement(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.innerHTML = '';
};
function yesno(boolean) {
    if (boolean) return 'Yes'
    else return 'No'
};
function enable_button(id, pretext = 'btn_') {
    let button = document.querySelector(`#${pretext}${id}`);
    if (button) button.removeAttribute('disabled');
};
function disable_button(id, pretext = 'btn_') {
    let button = document.querySelector(`#${pretext}${id}`);
    if (button) button.setAttribute('disabled', true);
};
function set_count(options = {}) {
    let _count = document.querySelector(`#${options.id}_count`);
    if (_count) _count.innerText = options.count || '0';
};
function set_innerText(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) element.innerText = options.text || options.value|| '';
};
function set_innerHTML(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) element.innerHTML = options.text || options.value|| '';
};
function set_breadcrumb(options = {}) {
    let breadcrumb = document.querySelector(`#${options.id || 'breadcrumb'}`);
    if (breadcrumb) {
        breadcrumb.innerText = options.text || '';
        if (options.href) breadcrumb.setAttribute('href', options.href);
    };
};
function set_href(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) {
        if (options.value) element.setAttribute('href', options.value);
        else               element.removeAttribute('href');
    };
};
function set_value(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) element.value = options.value || options.text || '';
};
function set_attribute(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element && options.attribute) {
        if (Array.isArray(options.attribute)) { 
            options.attribute.forEach(e => element.setAttribute(e.attribute, e.value || ''));
        } else element.setAttribute(options.attribute, options.value || '');
    };
};
function add_cell(row, options = {}) {
    let cell = row.insertCell();

    if      (options.text) cell.innerText = options.text || '';
    else if (options.html) cell.innerHTML = options.html || '';
    if      (options.append) {
        if (Array.isArray(options.append)) options.append.forEach(e => cell.appendChild(e))
        else cell.appendChild(options.append);
    };

    if (options.id)       cell.setAttribute('id', options.id);
    if (options.sort)     cell.setAttribute('data-sort', options.sort);
    if (options.classes)  options.classes.forEach(e => cell.classList.add(e));
    if (options.data)     options.data.forEach(e => cell.setAttribute(`data-${e.field}`, e.value));
    if (options.ellipsis) cell.classList.add('ellipsis1');
    return cell;
};
function show(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.classList.remove('hidden');
};
function hide(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.classList.add('hidden');
};
function remove_attribute(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element && options.attribute) {
        if (Array.isArray(options.attribute)) {
            options.attribute.forEach(e => element.removeAttribute(e))
        } else element.removeAttribute(options.attribute);
    };
};
function add_class(options) {
    let e = document.querySelector(`#${options.id}`);
    if (e && options.class) e.classList.add(options.class);
};
function add_classes(options) {
    let e = document.querySelector(`#${options.id}`);
    if (e && options.classes) options.classes.forEach(_class => e.classList.add(options.class));
};
function remove_class(options) {
    let e = document.querySelector(`#${options.id}`);
    if (e && options.class) e.classList.remove(options.class);
};
function isShown(id) {
    let e = document.querySelector(`#${id}`);
    if (e && !e.classList.contains('hidden')) return true
    else return false;
};
function print_user(user) {
    if (user) return `${user.rank.rank} ${user.full_name}`
    else return '';
};
function print_date(date, time = false) {
    if (date) {
        let str = new Date(date).toDateString();
        if (time) str += ` ${new Date(date).toLocaleTimeString()}`;
        return str;
    } else return '';
};
function print_time(date) {
    if (date) return new Date(date).toLocaleTimeString()
    else return '';
};
function print_nsn(nsn) {
    if (nsn && nsn.nsn_group && nsn.nsn_class && nsn.nsn_country) {
        return `${String(nsn.nsn_group.code).padStart(2, '0')}${String(nsn.nsn_class.code).padStart(2, '0')}-${String(nsn.nsn_country.code).padStart(2, '0')}-${nsn.item_number}`
    } else return '';
};
function print_account(account) {
    if (account) return `${account.name} | ${account.number}`
    else return '';
};
function print_size(size) {
    return `${size.size1}${(size.size2 ? `/${size.size2}` : '')}${(size.size3 ? `/${size.size3}` : '')}`
};
function print_size_text(item) {
    return `${item.size_text1}${(item.size_text2 ? `/${item.size_text2}` : '')}${(item.size_text3 ? `/${item.size_text3}` : '')}`
};
function table_date(date, time = false) {
    let _date = {
        sort: new Date(date).getTime(),
        text: print_date(date, time)
    };
    return _date;
}
function clear(id) {
    return new Promise((resolve, reject) => {
        let e = document.getElementById(id);
        if (!e) {
            console.log('Element not found');
            reject(new Error('Element not found'));
        } else {
            e.innerHTML = '';
            resolve(e);
        };
    })
};
function addReloadListener(func) {
    window.addEventListener('load', function () {
        let reload = document.querySelector('#reload')
        if (reload) reload.addEventListener('click', func);
    });
};
function addListener(btn, func, event = 'click') {
    let e = document.querySelector(`#${btn}`)
    if (e) e.addEventListener(event, func);
};
function toggle_checkbox_on_row_click(event) {
    let checkbox = event.target.parentNode.childNodes[0].querySelector('input');
    if (checkbox) checkbox.click();
};
function modalHide(id) {
    bootstrap.Modal.getOrCreateInstance(document.querySelector(`#mdl_${id}`)).hide();
};
function modalOnShow(id, func) {
    let modal = document.querySelector(`#mdl_${id}`);
    if (modal) modal.addEventListener('show.bs.modal', function (event){func(event)});
};
function modalOnHide(id, func) {
    let modal = document.querySelector(`#mdl_${id}`);
    if (modal) modal.addEventListener('hide.bs.modal', function (event){func(event)});
};
function modalIsShown(id) {
    let modal = document.querySelector(`#mdl_${id}`);
    if (modal && modal.classList.contains('show')) return true
    else return false;
};
function showTab(tab) {
    let tabHead = document.querySelector(`#${tab}-tab`),
        tabBody = document.querySelector(`#${tab}`);
    if (tabHead) tabHead.classList.add('active');
    if (tabBody) tabBody.classList.add('active', 'show');
};
function show_spinner(id) {
    let spn_results = document.querySelector(`#spn_${id}`);
    if (spn_results) spn_results.classList.remove('hidden');
};
function hide_spinner(id) {
    let spn_results = document.querySelector(`#spn_${id}`);
    if (spn_results) spn_results.classList.add('hidden');
};
function add_spinner(obj, options = {}) {
    obj.appendChild(new Spinner(options).e);
};
function remove_spinner(id) {
    let spinner = document.querySelector(`#spn_${id}`);
    if (spinner) spinner.remove();
};
function get_stock(size_id) {
    return new Promise(resolve => {
        sum({
            table: 'stocks',
            query: [`size_id=${size_id}`]
        })
        .then(([stock, options]) => resolve(stock))
        .catch(err => {
            console.log('Error getting stock:');
            console.log(err);
            resolve('?');
        });
    });
};
function status_query(statuses) {
    let statuses_selected = [];
    statuses.forEach(e => statuses_selected.push(e.value));
    return `"status":[${statuses_selected.join(',')}]`;
};
function sort_query(sort_cols) {
    if (sort_cols) {
        return {sort: {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir}};
    } else return {};
};

let path = window.location.pathname.toString().split('/');