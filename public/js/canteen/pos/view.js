function numberEvents() {
    document.querySelectorAll('.number').forEach(e => e.addEventListener('click', function (event) {numberBtn(event.target.dataset.number)}))
    window.addEventListener('keydown', function (e) {
        if      (['0','1','2','3','4','5','6','7','8','9'].includes(e.key)) numberBtn(e.key)
        else if (e.key === 'Backspace')                                     backspace();
    });
};
function numberBtn(num) {
    if (modalIsShown('sale_complete') && !isShown('btn_close_complete_sale')) {
        let tendered = document.querySelector('#tendered'),
            amt      = Number(String(tendered.value).replace('.', '').replace('£', ''));
        if (amt === 0) amt = String(num);
        else           amt += String(num);
        set_tendered(amt);
    };
};
function backspace() {
    if (modalIsShown('sale_complete') && !isShown('btn_close_complete_sale')) {
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

function getSale() {
    get({table: 'sale_current'})
    .then(function ([sale_id, options]) {
        if (sale_id) {
            set_innerText({id: 'sale_id', value: sale_id});
            document.querySelectorAll('.sale_id').forEach(e => e.setAttribute('value', sale_id));
            getSaleLines();
        } else alert('Sale not found');
    });
};
function getSaleLines() {
    let sale_id = document.querySelector('#sale_id');
    if (sale_id) {
        get({
            table: 'sale_lines',
            query: [`sale_id=${sale_id.innerText}`]
        })
        .then(function ([lines, options]) {
            clear_table('sale_lines')
            .then(tbl_sale_lines => {
                let total  = 0;
                if (lines.length === 0) {
                    disable_button('complete_sale')
                    disable_button('finish');
                } else {
                    enable_button('complete_sale');
                    enable_button('finish');
                    lines.forEach(line => {
                        total += line.qty * line.price;
                        let row = tbl_sale_lines.insertRow(-1);
                        add_cell(row, {text: line.item.name});
                        add_cell(row, {text: `£${Number(line.price).toFixed(2)}`});
                        add_cell(row, {text: line.qty});
                        add_cell(row, {text: `£${Number(line.qty * line.price).toFixed(2)}`});
                        let form = document.createElement('form');
                        form.setAttribute('id', `form_${line.sale_line_id}_minus`)
                        form.appendChild(new Hidden({
                            attributes: [
                                {field: 'name', value: 'line[sale_line_id]'},
                                {field: 'value', value: line.sale_line_id}
                            ]}).e
                        );
                        form.appendChild(new Hidden({
                            attributes: [
                                {field: 'name',  value: 'line[qty]'},
                                {field: 'value', value: -1}
                            ]}).e
                        );
                        form.appendChild(new Button({html: '<i class="fas fa-minus"></i>', small: true, noType: true}).e);
                        add_cell(row, {append: form});
                        addFormListener(
                            `${line.sale_line_id}_minus`,
                            'PUT',
                            `/sale_lines`,
                            {noConfirm: true, onComplete: getSaleLines}
                        );
                    });
                };
                document.querySelectorAll('.total').forEach(e => e.innerText = total.toFixed(2) || '0.00');
            });
        });
    };
};
function getPages() {
    get({table: 'pos_pages'})
    .then(function ([pages, options]) {
        document.querySelectorAll('.pos_header').forEach(e => e.remove());
        document.querySelectorAll('.pos_page')  .forEach(e => e.remove());
        let tab_headers = document.querySelector('#tab_headers'),
            tab_pages   = document.querySelector('#tab_pages');
        pages.forEach(page => {
            let tab_page = new Tab_Body(  {id: `page_${page.pos_page_id}`}).e;
            for (let r = 0; r <= 3; r++) {
                let row = document.createElement('div');
                row.classList.add('row', 'h-150-px');
                for (let c = 0; c <= 3; c++) {
                    let div = document.createElement('div');
                    div.setAttribute('id', `div_${page.pos_page_id}_${r}${c}`);
                    div.classList.add('col-6', 'col-sm-6', 'col-md-4', 'col-lg-4', 'col-xl-3', 'mb-2', 'item_btn')
                    div.appendChild(
                        new Form({
                            classes: ['h-100', 'form_view'],
                            append: [
                                new Hidden({attributes:[
                                    {field: 'name', value: 'line[item_id]'},
                                    {field: 'id',   value: `item_id_${page.pos_page_id}_${r}${c}`}
                                ]}).e,
                                new Hidden({
                                    attributes: [{field: 'name', value: 'line[sale_id]'}],
                                    classes:    ['sale_id']
                                }).e,
                                new Button({
                                    colour:     'light',
                                    text:       ' ',
                                    classes:    ['w-100', 'h-100', 'btn', 'btn-primary'],
                                    attributes: [{field: 'id', value: `btn_${page.pos_page_id}_${r}${c}`}],
                                    noType:     true
                                }).e
                            ],
                            data: [
                                {field: 'page',     value: page.pos_page_id},
                                {field: 'position', value: `${r}${c}`}
                            ],
                            attributes: [{field: 'id', value: `form_${page.pos_page_id}_${r}${c}`}],
                            submit: function (event) {
                                event.preventDefault();
                                sendData(this, 'POST', "/sale_lines", {onComplete: getSaleLines, noConfirm: true});
                            }
                        }).e
                    );
                    row.appendChild(div);
                };
                tab_page.appendChild(row);
            };
            tab_headers.appendChild(new Tab_Header({id: `page_${page.pos_page_id}`, text: page.title}).e);
            tab_pages  .appendChild(tab_page);
        });
        return true;
    })
    .then(result => {
        let all_items = document.querySelector('#div_all_items');
        if (all_items) {
            get({
                table: 'canteen_items',
                query: ['current=1']
            })
            .then(function ([items, options]) {
                items.forEach(item => {
                    all_items.appendChild(
                        new Form({
                            classes: ['col-6', 'col-sm-6', 'col-md-4', 'col-lg-4', 'col-xl-3', 'mb-2'],
                            append:  [
                                new Hidden({
                                    attributes:[{field: 'name', value: 'line[sale_id]'}],
                                    classes: ['sale_id']
                                }).e,
                                new Hidden({attributes:[
                                    {field: 'name',  value: 'line[item_id]'},
                                    {field: 'value', value: String(item.item_id)}
                                ]}).e,
                                new Button({
                                    text: `${item.name}\n£${Number(item.price).toFixed(2)}`,
                                    classes: ['w-100', 'h-100', 'btn', 'btn-primary'],
                                    noType: true
                                }).e
                            ],
                            submit: function (event) {
                                event.preventDefault();
                                sendData(this, 'POST', "/sale_lines", {onComplete: getSaleLines, noConfirm: true});
                            }
                        }).e
                    );
                });
                return true;
            })
            .catch(err => {
                console.log(err);
                return false;
            });
        } else return false;
    })
    .then(result => {
        get({table: 'pos_layouts'})
        .then(function ([layouts, options]) {
            layouts.forEach(layout => {
                set_value({id: `item_id_${layout.page_id}_${layout.button}`, value: layout.item_id});
                set_attribute({id: `div_${layout.page_id}_${layout.button}`, attribute: 'data-id', value: layout.item_id});
                let btn_form = document.querySelector(`#btn_${layout.page_id}_${layout.button}`)
                if (btn_form) {
                    if (layout.colour) btn_form.style.backgroundColor = `#${layout.colour}`;
                    btn_form.innerHTML = `${layout.item.name}<br>£${Number(layout.item.price).toFixed(2)}`;
                };
            });
            return true;
        })
        .catch(err => {
            console.log(err);
            return false;
        });
    })
    .then(result => {
        getSale();
        get({
            table: 'settings',
            query: ['name=default_pos_page']
        })
        .then(function ([settings, options]) {
            showTab(`page_${settings.value}`)
        });
        if (typeof addEditButtons === 'function') addEditButtons();
    });
};
function reset_sale_complete() {
    let change = document.querySelector('#change');
    change.innerText = '';
    hide('btn_close_sale_complete');
    show('btn_sale_complete');
    set_value({id: 'tendered', value: '0.00'})
};
addReloadListener(getSale);
window.addEventListener('load', function () {
    numberEvents();
    modalOnShow('sale_complete', reset_sale_complete);
    addFormListener(
        'sale_complete',
        'PUT',
        '/sales',
        {
            noConfirm: true,
            onComplete: [
                getSale,
                function (response) {
                    console.log(response);
                    if (typeof getCredits === 'function') getCredits;
                    set_innerText({id: 'change', text: `£${Number(response.change).toFixed(2)}`})
                    show('btn_close_sale_complete');
                    hide('btn_sale_complete');
                }
            ]
        }
    );
});