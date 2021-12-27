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
function removeID(id) {
    if (typeof id === 'string') document.querySelector(`#${id}`).remove();
    else id.remove();
};
function clearElement(id) {
    let e = document.querySelector(`#${id}`);
    if (e) e.innerHTML = '';
};
function yesno(boolean) {
    if (boolean) return 'Yes'
    else return 'No'
};
function enable_button(id, pretext = 'btn_') {
    let button = document.querySelector(`#${pretext}${id}`);
    if (button) button.removeAttribute('disabled');
};
function disable_button(id) {
    let button = document.querySelector(`#btn_${id}`);
    if (button) button.setAttribute('disabled', true);
};
function set_count(id, count) {
    let _count = document.querySelector(`#${id}_count`);
    if (_count) _count.innerText = count || '0';
};
function set_innerText(id, text = '') {
    let e = document.querySelector(`#${id}`);
    if (e) e.innerText = text;
};
function set_innerHTML(id, html = '') {
    let e = document.querySelector(`#${id}`);
    if (e) e.innerHTML = html;
};
function set_breadcrumb(text, id = 'breadcrumb', href = null) {
    let e = document.querySelector(`#${id}`);
    if (e) {
        e.innerText = text;
        if (href) e.setAttribute('href', href);
    };
};
function set_href(id, value = null) {
    let e = document.querySelector(`#${id}`);
    if (e) {
        if (value) e.setAttribute('href', value);
        else       e.removeAttribute('href');
    };
};
function set_data(id, field, value) {
    let e = document.querySelector(`#${id}`);
    if (e) e.setAttribute(`data-${field}`, value);
};
function set_value(id, text = '') {
    let e = document.querySelector(`#${id}`);
    if (e) e.value = text || '';
};
function set_attribute(id, attribute, value = null) {
    let e = document.querySelector(`#${id}`);
    if (e) {
        if (value) e.setAttribute(   attribute, value)
        else       e.removeAttribute(attribute);
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
    if (options.classes)  options.classes.forEach(e => cell.classList.add(e));
    if (options.data)     options.data.forEach(e => cell.setAttribute(`data-${e.field}`, e.value));
    if (options.ellipsis) cell.classList.add('ellipsis1');
    return cell;
};
function show(id) {
    let e = document.querySelector(`#${id}`);
    if (e) e.classList.remove('hidden');
};
function hide(id) {
    let e = document.querySelector(`#${id}`);
    if (e) e.classList.add('hidden');
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
        text: print_date(date, time)
    };
    return _date;
}
function clear(id) {
    return new Promise((resolve, reject) => {
        let e = document.getElementById(id);
        if (!e) {
            console.log(`Element not found: ${id}`);
            reject(new Error('Element not found'));
        } else {
            e.innerHTML = '';
            resolve(e);
        };
    })
};
function addReloadListener(func) {
    window.addEventListener('load', function () {
        let e = document.querySelector('#reload')
        if (e) e.addEventListener('click', func);
    });
};
function addListener(btn, func, event = 'click') {
    let e = document.querySelector(`#${btn}`)
    if (e) e.addEventListener(event, func);
};
function toggle_checkbox_on_row_click(event) {
    let e = event.target.parentNode.childNodes[0].querySelector('input');
    if (e) e.click();
};
function modalHide(id) {
    bootstrap.Modal.getOrCreateInstance(document.querySelector(`#mdl_${id}`)).hide();
};
function modalOnShow(id, func) {
    let e = document.querySelector(`#mdl_${id}`);
    if (e) e.addEventListener('show.bs.modal', function (event){func(event)});
};
function modalOnShown(id, func, args = []) {
    let e = document.querySelector(`#mdl_${id}`);
    if (e) e.addEventListener('shown.bs.modal', function (){func(...args)});
};
function modalOnHide(id, func) {
    let e = document.querySelector(`#mdl_${id}`);
    if (e) e.addEventListener('hide.bs.modal', function (event){func(event)});
};
function modalIsShown(id) {
    let e = document.querySelector(`#mdl_${id}`);
    if (e && e.classList.contains('show')) return true
    else return false;
};
function show_tab(tab) {
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
            where: {size_id: size_id}
        })
        .then(([stock, options]) => resolve(stock))
        .catch(err => {
            console.log('Error getting stock:');
            console.log(err);
            resolve('?');
        });
    });
};
function checked_statuses() {
    let selected = null,
        statuses = document.querySelectorAll(".status:checked") || [];
    if (statuses && statuses.length > 0) {
        selected = []
        statuses.forEach(e => selected.push(e.value));
    };
    return selected
};
function selected_user(id = 'sel_users') {
    let sel_users = document.querySelector(`#${id}`) || {value: ''};
    if (sel_users && sel_users.value !== '') return sel_users.value;
    else return null
};
function get_pagination(table) {
    let limit  = document.querySelector(`.limit_${ table} .active`),
        offset = document.querySelector(`.offset_${table} .active`),
        _return = {};
    if (limit ) _return.limit  = limit .dataset.value;
    if (offset) _return.offset = offset.dataset.value;
    return _return;
};
function add_page_links(count, limit, offset, table, func) {
    clear(`page_buttons_${table}`)
    .then(page_buttons => {
        let listener = function (e) {
            let offset = document.querySelector(`.offset_${table} .active`);
            offset.classList.remove('active');
            e.target.parentNode.classList.add('active');
            func();
        };
        if (!offset) offset = 0;
        limit = Number(limit || 0);
        offset = Number(offset || 0);
        count = Number(count);
        let max = limit * (Number(offset) + 1);
        if (max > count) max = count;
        set_innerText(`${table}_page_low`, (limit * offset) + 1);
        set_innerText(`${table}_page_high`, max);
        set_innerText(`${table}_page_max`,  count);
        let page_count = Math.ceil(count/limit);
        if (page_count < offset) offset = 0;
        if (limit) {
            for (let i = 0; i < page_count; i++) {
                page_buttons.appendChild(
                    new Page_Number({
                        text:     i,
                        listener: listener,
                        selected: (offset === i),
                        table:    table
                    }).e
                );
            };
        } else page_buttons.appendChild(
            new Page_Number({
                text:     0,
                listener: listener,
                selected: true,
                table:    table
            }).e
        );
    });
};
function sort_listeners(table, func, options, getOnLoad = true) {
    window.addEventListener('load', function () {
        let limit_func = function (e) {
            let limit = document.querySelector(`.limit_${table} .active`);
            if (limit) {
                limit.classList.remove('active');
                e.target.parentNode.classList.add('active');
                if (func) func();
            };
        };
        addListener(`limit_${table}_10`,  limit_func);
        addListener(`limit_${table}_20`,  limit_func);
        addListener(`limit_${table}_30`,  limit_func);
        addListener(`limit_${table}_all`, limit_func);
        addListener(`sort_${ table}`,     func, 'input');
        addListener(`sort_${ table}_dir`, func, 'input');
        clear(`sort_${table}`)
        .then(sort => options.forEach(o => sort.appendChild(new Option(o).e)))
        .catch(err => console.log(err))
        .finally(() => {if (func && getOnLoad) func()});
    });
};
let path = window.location.pathname.toString().split('/');