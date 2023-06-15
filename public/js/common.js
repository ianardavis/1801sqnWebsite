const path = window.location.pathname.toString().split('/');
function removeID(id) {
    if (typeof id === 'string') {
        let e = document.querySelector(`#${id}`);
        if (e) e.remove();
    } else id.remove();
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
function set_count(id, count) {
    let _count = document.querySelector(`#${id}_count`);
    if (_count) _count.innerText = count || '0';
};
function set_innerText(id, text = '') {
    let e = document.querySelector(`#${id}`);
    if (e) e.innerText = text;
};
function set_breadcrumb(text, id = 'breadcrumb', href = null) {
    let e = document.querySelector(`#${id}`);
    if (e) {
        e.innerText = text;
        if (href) e.setAttribute('href', href);
    };
};
function clear_statuses(max, statuses) {
    for (s=1; s<=max; s++) {
        set_badge(s, 'secondary', statuses[s]);
    };
};
function set_badge(bdg, colour, text = '') {
    let badge = document.querySelector(`#bdg_status_${bdg}`);
    if (badge) {
        badge.classList.remove('text-bg-success');
        badge.classList.remove('text-bg-danger');
        badge.classList.remove('text-bg-secondary');
        badge.classList.add(`text-bg-${colour}`);
        if (text) badge.innerText = text;
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

    if (options.append) {
        if (Array.isArray(options.append)) options.append.forEach(e => cell.appendChild(e))
        else cell.appendChild(options.append);
    };

    if (options.id)      cell.setAttribute('id', options.id);
    if (options.classes) options.classes.forEach(e => cell.classList.add(e));
    if (options.data)    options.data.forEach(e => cell.setAttribute(`data-${e.field}`, e.value));
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
    if (size) {
        return `${size.size1}${(size.size2 ? `/${size.size2}` : '')}${(size.size3 ? `/${size.size3}` : '')}`;
    } else {
        return '';
    };
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
        if (e) {
            e.innerHTML = '';
            resolve(e);
        } else {
            console.error(`Element not found: ${id}`);
            reject(new Error('Element not found'));
        };
    })
};
function add_listener(btn, func, event = 'click') {
    let e = document.querySelector(`#${btn}`)
    if (e) e.addEventListener(event, func);
};
function toggle_checkbox_on_row_click(event) {
    let e = event.target.parentNode.childNodes[0].querySelector('input');
    if (e) e.click();
};
function modalHide(id) {
    bootstrap.Modal.getInstance(document.querySelector(`#mdl_${id}`)).hide();
};
function sidebarClose(id) {
    // const sdb = document.querySelector(`#sdb_${id}`);
    const sdb = new bootstrap.Offcanvas(`#sdb_${id}`);
    console.log(sdb);
    sdb.hide();
};
function modalOnShow(id, func) {
    let e = document.querySelector(`#mdl_${id}`);
    if (e) e.addEventListener('show.bs.modal', function (event){func(event)});
};
function sidebarOnShow(id, func) {
    let e = document.querySelector(`#sdb_${id}`);
    if (e) e.addEventListener('show.bs.offcanvas', function (event){func(event)});
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
function remove_spinner(id) {
    let spinner = document.querySelector(`#spn_${id}`);
    if (spinner) spinner.remove();
};
function get_stock(size_id) {
    return new Promise(resolve => {
        get({
            action: 'sum',
            table: 'stocks',
            where: {size_id: size_id}
        })
        .then(([stock, options]) => resolve(stock))
        .catch(err => {
            console.error('Error getting stock:', err);
            resolve('?');
        });
    });
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
        limit  = Number(limit  || 0);
        offset = Number(offset || 0);
        count  = Number(count);
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
function toProperCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
};

function set_status_filter_options(id, options) {
    let select = document.querySelector(`#filter_${id}_status`);
    options.forEach(option => {
        let opt = document.createElement('option');
        opt.setAttribute('value', option.value);
        opt.innerText = option.text;
        if (option.selected) opt.setAttribute('selected', true);
        select.appendChild(opt);
    });
    select.setAttribute('size', options.length)
};
function getSelectedOptions(id) {
    let e = document.querySelector(`#${id}`);
    if (e && e.selectedOptions) {
        return Array.from(e.selectedOptions).map(({ value }) => value)
    } else return [];
};
function filter_item(id) {
    const item = document.querySelector(`#filter_${id}_description`);
    if (item && item.value) return {description: item.value}
    else return {};
};
function filter_size(id) {
    const size1 = document.querySelector(`#filter_${id}_size_1`);
    const size2 = document.querySelector(`#filter_${id}_size_2`);
    const size3 = document.querySelector(`#filter_${id}_size_3`);
    let like = {};
    if (size1 && size1.value) like.size1 = size1.value;
    if (size2 && size2.value) like.size2 = size2.value;
    if (size3 && size3.value) like.size3 = size3.value;
    return like;

};
function filter_status(id) {
    const statuses = getSelectedOptions(`filter_${id}_status`);
    if (statuses && statuses.length > 0) return {status: statuses}
    else return {};
};
function filter_supplier(id) {
    const supplier = document.querySelector(`#filter_${id}_supplier`);
    if (supplier && supplier .value !== '') return {supplier_id: supplier.value}
    else return {};
};
function filter_date_from(id) {
    const date_from = document.querySelector(`#filter_${id}_createdAt_from`);
    if (date_from && date_from.value !== '') return {column: 'createdAt', value: date_from.value}
    else return null;
};
function filter_date_to(id) {
    const date_to = document.querySelector(`#filter_${id}_createdAt_to`);
    if (date_to && date_to.value !== '') return {column: 'createdAt', value: date_to.value}
    else return null;
};
function filter_user(id) {
    const user = document.querySelector(`#filter_${id}_user`);
    let where = {};
    if (user && user.value) where[`user_id_${id}`] = user.value;
    return where;
};
function filter_gender(id) {
    const genders = getSelectedOptions(`filter_${id}_gender`);
    if (genders && genders.length > 0) return {gender_id: genders}
    else return {};
};

function add_sort_listeners(table, func) {
    function sort(tr, func) {
        if (!tr.dataset.dir) {
            (tr.parentNode.querySelectorAll("[data-dir]")).forEach(e => {
                delete e.dataset.dir;
                e.querySelectorAll('.fas').forEach(e => {
                     e.classList.remove('fa-arrow-up');
                     e.classList.remove('fa-arrow-down');
                });
            });
        };
        let i = tr.querySelector('.fas');
        if (!tr.dataset.dir || tr.dataset.dir === 'DESC') {
            tr.dataset.dir = 'ASC';
            if (i) {
                i.classList.remove('fa-arrow-down')
                i.classList.add(   'fa-arrow-up');
            };
        } else {
            tr.dataset.dir = 'DESC';
            if (i) {
                i.classList.remove('fa-arrow-up')
                i.classList.add(   'fa-arrow-down');
            };
        };
        func();
    };
    let limit_func = function (e) {
        let limit = document.querySelector(`.limit_${table} .active`);
        if (limit) {
            limit.classList.remove('active');
            e.target.parentNode.classList.add('active');
            if (func) func();
        };
    };
    add_listener(`limit_${table}_10`,  limit_func);
    add_listener(`limit_${table}_20`,  limit_func);
    add_listener(`limit_${table}_30`,  limit_func);
    add_listener(`limit_${table}_all`, limit_func);
    
    let tbl = document.querySelector(`#tbl_${table}_head`);
    if (tbl) {
        tbl.querySelectorAll("[data-column]").forEach(th => {
            th.insertAdjacentHTML('afterbegin', '<i class="fas"></i>');
            th.addEventListener('click', function () {sort(this, func)});
        });
        let selected = tbl.parentElement.querySelector("[data-dir]");
        if (selected) {
            let i = selected.querySelector('i');
            if (i) i.classList.add(`fa-arrow-${(selected.dataset.dir === 'ASC' ? 'up' : 'down')}`);
        };
    };
};
function div_details(id, index) {
    return new Div({
        attributes: [
            {field: 'id', value: `details_${id}`}
        ],
        data: [{field: 'index', value: index}]
    }).e;
};
function redirect_on_error(err, path) {
    alert(err);
    window.location.assign(path);
};
window.addEventListener('load', function() {
    let headers = [];
    if (path[1]) headers.push(toProperCase(path[1]));
    headers.push('1801 (Alnwick) Sqn ATC');
    document.title = headers.join(" | ");
});
