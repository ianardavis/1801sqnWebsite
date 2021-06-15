let sale_id = null, sale_loaded = false, items_loaded = false;
function numberBtn(num) {
    if ($('#mdl_sale_complete').hasClass('show') && $('#btn_close_complete_sale').hasClass('hidden')) {
        let tendered = document.querySelector('#tendered'),
            amt      = Number(String(tendered.value).replace('.', '').replace('£', ''));
        if (amt === 0) amt = String(num);
        else           amt += String(num);
        set_tendered(amt);
    };
};
function backspace() {
    if ($('#mdl_sale_complete').hasClass('show') && $('#btn_close_complete_sale').hasClass('hidden')) {
        let tendered = document.querySelector('#tendered'),
            amt = Number(String(tendered.value).replace('.', ''));
            amt = String(amt);
        set_tendered(amt.substring(0, amt.length - 1))
    };
};
function set_tendered(amt) {
    amt = String(amt).padStart(3, '0');
    amt = amt.substring(0, amt.length - 2) + "." + amt.substring(amt.length - 2);
    set_value({id: 'tendered', value: amt});
};
function clear_alert() {
    let alerts = document.querySelectorAll('.alert_pos');
    alerts.forEach(e => e.innerText = '');
};
function alert(message) {
    let alerts = document.querySelectorAll('.alert_pos');
    alerts.forEach(e => e.innerText = message);
    setTimeout(clear_alert, 3000);
};
function load_check() {
    if (sale_loaded === true && items_loaded === true && sale_id) {
        let sale_id_fields = document.querySelectorAll('.sale_id');
        sale_id_fields.forEach(field => {
            field.setAttribute('value', sale_id);
        });
        getSaleLines();
    };
};
function getSale() {
    get({table: 'user_sale'})
    .then(function ([_sale_id, options]) {
        if (_sale_id) {
            set_breadcrumb({text: _sale_id})
            sale_id = _sale_id;
            sale_loaded = true;
            load_check();
        } else alert('Sale not found');
    });
};
function getSaleLines() {
    get(
        {
            table: 'sale_lines',
            query: [`sale_id=${sale_id}`]
        },
        function (lines, options) {
            clearElement('tbl_sale_lines');
            let tbl_sale_lines = document.querySelector('#tbl_sale_lines'),
                totals         = document.querySelectorAll('.total'),
                total          = 0;
            if (lines.length === 0) {
                set_attribute({id: 'btn_complete_sale', attribute: 'disabled', value: true});
                set_attribute({id: 'btn_finish',        attribute: 'disabled', value: true});
            } else {
                enable_button('complete_sale');
                enable_button('finish');
                lines.forEach(line => {
                    total += line._qty * line._price;
                    let row = tbl_sale_lines.insertRow(-1);
                    add_cell(row, {text: line.item._name});
                    add_cell(row, {text: `£${Number(line._price).toFixed(2)}`});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {text: `£${Number(line._qty * line._price).toFixed(2)}`});
                    let form = document.createElement('form');
                    form.setAttribute('id', `form_${line.line_id}_minus`)
                    form.appendChild(new Hidden({
                        attributes: [
                            {field: 'name', value: 'line[line_id]'},
                            {field: 'value', value: line.line_id}
                        ]}).e
                    );
                    form.appendChild(new Hidden({
                        attributes: [
                            {field: 'name', value: 'line[_qty]'},
                            {field: 'value', value: -1}
                        ]}).e
                    );
                    form.appendChild(new Button({html: '<i class="fas fa-minus"></i>', small: true}).e);
                    add_cell(row, {append: form});
                    addFormListener(
                        `${line.line_id}_minus`,
                        'PUT',
                        `/canteen/sale_lines`,
                        {noConfirm: true, onComplete: getSaleLines}
                    );
                });
            };
            totals.forEach(e => {
                e.innerText = total.toFixed(2) || '0.00'
            });
        }
    );
};
function getPages() {
    get({table: 'pos_pages'})
    .then(function ([pages, options]) {
        document.querySelectorAll('.pos_header').forEach(e => e.remove());
        document.querySelectorAll('.pos_page')  .forEach(e => e.remove());
        let tab_headers = document.querySelector('#tab_headers'),
            tab_pages   = document.querySelector('#tab_pages');
        pages.forEach(page => {
            tab_headers.appendChild(new Tab_Header({id: `page_${page.pos_page_id}`, text: page.title}).e);
            tab_pages.appendChild(new Tab_Body({id: `page_${page.pos_page_id}`}).e);
        });
        return true;
    })
    .then(result => {
        get({
            table: 'canteen_items',
            query: ['current=1']
        })
        .then(function ([items, options]) {
            get({table: 'pos_layouts'})
            .then(function ([layouts, options]) {
                return {items: items, layouts: layouts};
            });
        });
    })
    .then(result => {
        result.items.forEach(item => {
            //     pane_items = new Div({classes: ['row', 'h-150-px']}).e;
            // page.items.forEach(item => {
            //     pane_items.appendChild(
            //         new Form({
            //             classes: ['col-6', 'col-sm-6', 'col-md-4', 'col-lg-4', 'col-xl-3', 'mb-2', 'h-100'],
            //             append: [
            //                 new Hidden({
            //                     attributes:[{field: 'name', value: 'line[sale_id]'}],
            //                     classes: ['sale_id']
            //                 }).e,
            //                 new Hidden({attributes:[
            //                     {field: 'name', value: 'line[item_id]'},
            //                     {field: 'value', value: String(item.item_id)}
            //                 ]}).e,
            //                 new Button({
            //                     text: `${item.item.name}\n£${Number(item.item.price).toFixed(2)}`,
            //                     classes: ['w-100', 'h-100', 'btn', 'btn-primary']
            //                 }).e
            //             ],
            //             submit: function (event) {
            //                 event.preventDefault();
            //                 sendData(this, 'POST', "/sale_lines", {onComplete: getSaleLines, noConfirm: true});
            //             }
            //         }).e
            //     );
            // });
            // pane.appendChild(pane_items);
        });
    })
    .then(result => {
        get({
            table: 'settings',
            query: ['name=default_pos_page']
        })
        .then(function ([settings, options]) {
            showTab(`page_${settings.value}`)
        });
        items_loaded = true;
        load_check();
    });
};
function reset_sale_complete() {
    let change = document.querySelector('#change');
    change.innerText = '';
    hide('btn_close_sale_complete');
    show('btn_sale_complete');
    set_value({id: 'tendered', value: '0.00'})
};
addReloadListener(function() {
        sale_id      = null;
        sale_loaded  = false;
        items_loaded = false;
        getPages();
        getSale();
    })
window.addEventListener('load', function () {
    modalOnShow('sale_complete', reset_sale_complete);
    window.addEventListener('keydown', function (e) {
        if      (['0','1','2','3','4','5','6','7','8','9'].includes(e.key)) numberBtn(e.key)
        else if (e.key === 'Backspace')                                     backspace();
    });
    addFormListener(
        'sale_complete',
        'PUT',
        '/sales',
        {
            noConfirm: true,
            onComplete: [
                getSale,
                function (response) {
                    if (typeof getCredits === 'function') getCredits;
                    set_innerText({id: 'change', text: `£${Number(response.change).toFixed(2)}`})
                    show('btn_close_sale_complete');
                    hide('btn_sale_complete');
                }
            ]
        }
    );
});