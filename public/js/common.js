const path = window.location.pathname.toString().split('/');
function getElement(id) {
    return new Promise((resolve, reject) => {
        const select = document.getElementById(id);
        if (select) {
            resolve(select);

        } else {
            reject(new Error(`Element not found: ${id}`));

        };
    });
};
function removeID(id) {
    if (typeof id === 'string') {
        getElement(id)
        .then(e => e.remove())
        .catch(err => {
            console.error(`common.js | removeID | ${err.message}`);
            reject(err);
        });
    } else id.remove();
};
function yesno(boolean) {
    if (boolean) return 'Yes'
    else return 'No'
};
function enableButton(id, pretext = 'btn_') {
    getElement(`${pretext}${id}`)
    .then(button => button.removeAttribute('disabled'))
    .catch(err => {
        console.error(`common.js | enableButton | ${err.message}`);
        reject(err);
    });
};
function disableButton(id, pretext = 'btn_') {
    getElement(`${pretext}${id}`)
    .then(button => button.setAttribute('disabled', true))
    .catch(err => {
        console.error(`common.js | disableButton | ${err.message}`);
        reject(err);
    });
};
function setCount(id, count) {
    getElement(`${id}_count`)
    .then(_count => _count.innerText = count || '0')
    .catch(err => {
        console.error(`common.js | setCount | ${err.message}`);
        reject(err);
    });
};
function setInnerText(id, text = '') {
    getElement(id)
    .then(e => e.innerText = text)
    .catch(err => {
        console.error(`common.js | setInnerText | ${err.message}`);
        reject(err);
    });
};
function setBreadcrumb(text, id = 'breadcrumb', href = null) {
    getElement(id)
    .then(e => {
        e.innerText = text;
        if (href) e.setAttribute('href', href);
    })
    .catch(err => {
        console.error(`common.js | setBreadcrumb | ${err.message}`);
        reject(err);
    });
};
function clearStatuses(max, statuses) {
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
function setHREF(id, value = null) {
    getElement(id)
    .then(e => {
        if (value) e.setAttribute('href', value);
        else       e.removeAttribute('href');
    })
    .catch(err => {
        console.error(`common.js | setHREF | ${err.message}`);
        reject(err);
    });
};
function setData(id, field, value) {
    getElement(id)
    .then(e => e.setAttribute(`data-${field}`, value))
    .catch(err => {
        console.error(`common.js | setData | ${err.message}`);
        reject(err);
    });
};
function selectableRow(row, row_id,  tbl, func) {
    row.setAttribute('data-row_id', row_id);
    row.addEventListener('click', function () {
        tbl.querySelectorAll('.selected_row').forEach(e => e.classList.remove('selected_row'));
        row.classList.add('selected_row');
        func();
    });
};
function setValue(id, text = '') {
    getElement(id)
    .then(e => e.value = text || '')
    .catch(err => {
        console.error(`common.js | setValue | ${err.message}`);
        reject(err);
    });
};
function setAttribute(id, attribute, value = null) {
    getElement(id)
    .then(e => {
        if (value) e.setAttribute(   attribute, value)
        else       e.removeAttribute(attribute);
    })
    .catch(err => {
        console.error(`common.js | setAttribute | ${err.message}`);
        reject(err);
    });
};
function addCell(row, options = {}) {
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
    getElement(id)
    .then(e => e.classList.remove('hidden'))
    .catch(err => {
        console.error(`common.js | show | ${err.message}`);
        reject(err);
    });
};
function hide(id) {
    getElement(id)
    .then(e => e.classList.add('hidden'))
    .catch(err => {
        console.error(`common.js | hide | ${err.message}`);
        reject(err);
    });
};
function printUser(user) {
    if (user) return `${user.rank.rank} ${user.full_name}`
    else return '';
};
function printDate(date, time = false) {
    if (date) {
        let str = new Date(date).toDateString();
        if (time) str += ` ${new Date(date).toLocaleTimeString()}`;
        return str;
    } else return '';
};
function printTime(date) {
    if (date) return new Date(date).toLocaleTimeString()
    else return '';
};
function printNSN(nsn) {
    if (nsn && nsn.nsn_group && nsn.nsn_class && nsn.nsn_country) {
        return `${String(nsn.nsn_group.code).padStart(2, '0')}${String(nsn.nsn_class.code).padStart(2, '0')}-${String(nsn.nsn_country.code).padStart(2, '0')}-${nsn.item_number}`
    } else return '';
};
function printAccount(account) {
    if (account) return `${account.name} | ${account.number}`
    else return '';
};
function printSize(size) {
    if (size) return `${size.size1}${(size.size2 ? `/${size.size2}` : '')}${(size.size3 ? `/${size.size3}` : '')}`;
    else return '';
};
function printSizeText(item) {
    return `${item.size_text1}${(item.size_text2 ? `/${item.size_text2}` : '')}${(item.size_text3 ? `/${item.size_text3}` : '')}`
};
function tableDate(date, time = false) {
    return { text: printDate(date, time) };
}
function clear(id) {
    return new Promise((resolve, reject) => {
        getElement(id)
        .then(e => {
            e.innerHTML = '';
            resolve(e);
        })
        .catch(err => {
            console.error(`common.js | clear | ${err.message}`);
            reject(err);
        });
    });
};
function addListener(btn, func, event = 'click') {
    getElement(btn)
    .then(e => e.addEventListener(event, func))
    .catch(err => {
        console.error(`common.js | addListener | ${err.message}`);
        reject(err);
    });
};
function toggleCheckboxOnRowClick(event) {
    let e = event.target.parentNode.childNodes[0].querySelector('input');
    if (e) e.click();
};
function modalHide(id) {
    const myModal = new bootstrap.Modal(`#mdl_${id}`);
    myModal.hide();
};
function sidebarClose(id) {
    const sdb = new bootstrap.Offcanvas(`#sdb_${id}`);
    sdb.hide();
};
function modalOnShow(id, func) {
    getElement(`mdl_${id}`)
    .then(e => e.addEventListener('show.bs.modal', function (event){func(event)}))
    .catch(err => {
        console.error(`common.js | modalOnShow | ${err.message}`);
        reject(err);
    });
};
function sidebarOnShow(id, func) {
    getElement(`#sdb_${id}`)
    .then(e => e.addEventListener('show.bs.offcanvas', function (event){func(event)}))
    .catch(err => {
        console.error(`common.js | sidebarOnShow | ${err.message}`);
        reject(err);
    });
};
function modalOnShown(id, func, args = []) {7
    getElement(`mdl_${id}`)
    .then(e => e.addEventListener('shown.bs.modal', function (){func(...args)}))
    .catch(err => {
        console.error(`common.js | modalOnShown | ${err.message}`);
        reject(err);
    });
};
function modalOnHide(id, func) {
    getElement(`mdl_${id}`)
    .then(e => e.addEventListener('hide.bs.modal', function (event){func(event)}))
    .catch(err => {
        console.error(`common.js | modalOnHide | ${err.message}`);
        reject(err);
    });
};
function modalIsShown(id) {
    getElement(`mdl_${id}`)
    .then(e => {return e.classList.contains('show')})
    .catch(err => {
        console.error(`common.js | modalIsShown | ${err.message}`);
        reject(err);
    });
};
function showTab(tab) {
    Promise.all(
        getElement(`${tab}-tab`),
        getElement(tab)
    )
    .then(([tabHead, tabBody]) => {
        tabHead.classList.add('active');
        tabBody.classList.add('active', 'show');
    })
    .catch(err => {
        console.error(`common.js | showTab | ${err.message}`);
        reject(err);
    });
};
function showSpinner(id) {
    getElement(`spn_${id}`)
    .then(e => e.classList.remove('hidden'))
    .catch(err => {
        console.error(`common.js | showSpinner | ${err.message}`);
    });
};
function hideSpinner(id) {
    getElement(`spn_${id}`)
    .then(e => e.classList.add('hidden'))
    .catch(err => {
        console.error(`common.js | hideSpinner | ${err.message}`);
        reject(err);
    });
};
function removeSpinner(id) {
    removeID(`spn_${id}`)
    .catch(err => {
        console.error(`common.js | removeSpinner | ${err.message}`);
        reject(err);
    });
};
function getStock(size_id) {
    return new Promise(resolve => {
        get({
            action: 'sum',
            table: 'stocks',
            where: {size_id: size_id}
        })
        .then(([stock, options]) => resolve(stock))
        .catch(err => {
            console.error('common.js | getStock | Error getting stock:', err);
            resolve('?');
        });
    });
};
function addPageLinks(count, limit, offset, table, func) {
    clear(`page_buttons_${table}`)
    .then(page_buttons => {
        function listener(e) {
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
        setInnerText(`${table}_page_low`, (limit * offset) + 1);
        setInnerText(`${table}_page_high`, max);
        setInnerText(`${table}_page_max`,  count);
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

function setStatusFilterOptions(id, options) {
    getElement(`filter_${id}_status`)
    .then(select => {
        options.forEach(option => {
            select.appendChild(new Option(option).e);
        });
        select.setAttribute('size', options.length);
    })
    .catch(err => {
        console.error(`common.js | setStatusFilterOptions | ${err.message}`);
        reject(err);
    });
};
function getSelectedOptions(id) {
    getElement(id)
    .then(select => {
        if (select.selectedOptions) {
            return Array.from(select.selectedOptions).map(({ value }) => value)
        } else return [];
    })
    .catch(err => {
        console.error(`common.js | getSelectedOptions | ${err.message}`);
        reject(err);
    });
};
function filterItem(id) {
    getElement(`filter_${id}_description`)
    .then(e => {
        if (e.value) return {description: e.value}
    })
    .catch(err => {
        console.error(`common.js | filterItem | ${err.message}`);
        reject(err);
    });
};
function filterSize(id) {
    Promise.all(
        getElement(`filter_${id}_size_1`),
        getElement(`filter_${id}_size_2`),
        getElement(`filter_${id}_size_3`)
    )
    .then(([size1, size2, size3]) => {
        let like = {};
        if (size1 && size1.value) like.size1 = size1.value;
        if (size2 && size2.value) like.size2 = size2.value;
        if (size3 && size3.value) like.size3 = size3.value;
        return like;
    })
    .catch(err => {
        console.error(`common.js | filterItem | ${err.message}`);
        reject(err);
    });
};
function filterStatus(id) {
    const statuses = getSelectedOptions(`filter_${id}_status`);
    if (statuses && statuses.length > 0) return {status: statuses}
    else return {};
};
function filterSupplier(id) {
    getElement(`filter_${id}_supplier`)
    .then(e => {
        if (e.value !== '') return {supplier_id: e.value}
        else return {};
    })
    .catch(err => {
        console.error(`common.js | filterSupplier | ${err.message}`);
        reject(err);
    });
};
function filterDateFrom(id) {
    getElement(`filter_${id}_createdAt_from`)
    .then(e => {
        if (e.value !== '') return {column: 'createdAt', value: e.value}
        else return null;
    })
    .catch(err => {
        console.error(`common.js | filterDateFrom | ${err.message}`);
        reject(err);
    });
};
function filterDateTo(id) {
    getElement(`filter_${id}_createdAt_to`)
    .then(e => {
        if (e.value !== '') return {column: 'createdAt', value: e.value}
        else return null;
    })
    .catch(err => {
        console.error(`common.js | filterDateTo | ${err.message}`);
        reject(err);
    });
};
function filterUser(id) {
    getElement(`filter_${id}_user`)
    .then(e => {
        let where = {};
        if (e.value) where[`user_id_${id}`] = e.value;
        return where;
    })
    .catch(err => {
        console.error(`common.js | filterUser | ${err.message}`);
        reject(err);
    });
};
function filterGender(id) {
    const genders = getSelectedOptions(`filter_${id}_gender`);
    if (genders && genders.length > 0) return {gender_id: genders}
    else return {};
};

function addSortListeners(table, func) {
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
    function limitFunc(e) {
        let limit = document.querySelector(`.limit_${table} .active`);
        if (limit) {
            limit.classList.remove('active');
            e.target.parentNode.classList.add('active');
            if (func) func();
        };
    };
    addListener(`limit_${table}_10`,  limitFunc);
    addListener(`limit_${table}_20`,  limitFunc);
    addListener(`limit_${table}_30`,  limitFunc);
    addListener(`limit_${table}_all`, limitFunc);
    
    getElement(`tbl_${table}_head`)
    .then(tbl => {
        tbl.querySelectorAll("[data-column]").forEach(th => {
            th.insertAdjacentHTML('afterbegin', '<i class="fas"></i>');
            th.addEventListener('click', function () {sort(this, func)});
        });
        let selected = tbl.parentElement.querySelector("[data-dir]");
        if (selected) {
            let i = selected.querySelector('i');
            if (i) i.classList.add(`fa-arrow-${(selected.dataset.dir === 'ASC' ? 'up' : 'down')}`);
        };
    })
    .catch(err => {
        console.error(`common.js | addSortListeners | ${err.message}`);
        reject(err);
    });
};
function divDetails(id, index) {
    return new Div({
        attributes: [
            {field: 'id', value: `details_${id}`}
        ],
        data: [{field: 'index', value: index}]
    }).e;
};
function redirectOnError(err, path) {
    alert(err);
    window.location.assign(path);
};
window.addEventListener('load', function() {
    let headers = [];
    if (path[1]) headers.push(toProperCase(path[1]));
    headers.push('1801 (Alnwick) Sqn ATC');
    document.title = headers.join(" | ");
});
